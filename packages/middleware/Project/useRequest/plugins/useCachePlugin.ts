
import type { UseRequestPlugin } from '../types';
import type { CachedData } from '../utils/cache';
import { getCache, setCache } from '../utils/cache';
import { getCachePromise, setCachePromise } from '../utils/cachePromise';
import { subscribe, trigger } from '../utils/cacheSubscribe';

const useCachePlugin: UseRequestPlugin<any, any[]> = (
  fetchInstance,
  {
    cacheKey,
    cacheTime = 5 * 60 * 1000,
    staleTime = 0,
    setCache: customSetCache,
    getCache: customGetCache,
  },
) => {
  let unSubscribeRef =() => {};
  let currentPromiseRef = null;

  const _setCache = (key: string, cachedData: CachedData) => {
    customSetCache ? customSetCache(cachedData) : setCache(key, cacheTime, cachedData);
    trigger(key, cachedData.data);
  };

  const _getCache = (key: string, params: any[] = []) => {
    return customGetCache ? customGetCache(params) : getCache(key);
  };

  watchEffect(() => {
    if (!cacheKey) return;

    // get data from cache when init
    const cacheData = _getCache(cacheKey);
    if (cacheData && Object.hasOwnProperty.call(cacheData, 'data')) {
      fetchInstance.state.data = cacheData.data;
      fetchInstance.state.params = cacheData.params;

      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        fetchInstance.state.loading = false;
      }
    }

    // subscribe same cachekey update, trigger update
    unSubscribeRef = subscribe(cacheKey, (data) => {
      fetchInstance.setState({ data });
    });
  });

  // onUnmounted(() => {
  //   unSubscribeRef?.();
  // });

  if (!cacheKey) {
    return {};
  }

  return {
    onBefore: (params) => {
      const cacheData = _getCache(cacheKey, params);

      if (!cacheData || !Object.hasOwnProperty.call(cacheData, 'data')) {
        return {};
      }

      // If the data is fresh, stop request
      if (staleTime === -1 || new Date().getTime() - cacheData.time <= staleTime) {
        return {
          loading: false,
          data: cacheData?.data,
          error: undefined,
          returnNow: true,
        };
      } else {
        // If the data is stale, return data, and request continue
        return { data: cacheData?.data, error: undefined };
      }
    },
    onRequest: (service, args) => {
      let servicePromise = getCachePromise(cacheKey);

      // If has servicePromise, and is not trigger by self, then use it
      if (servicePromise && servicePromise !== currentPromiseRef) {
        return { servicePromise };
      }

      servicePromise = service(...args);
      currentPromiseRef = servicePromise;
      setCachePromise(cacheKey, servicePromise);

      return { servicePromise };
    },
    onSuccess: (data, params) => {
      if (cacheKey) {
        // cancel subscribe, avoid trgger self
        unSubscribeRef?.();

        _setCache(cacheKey, { data, params, time: new Date().getTime() });

        // resubscribe
        unSubscribeRef = subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
    onMutate: (data) => {
      if (cacheKey) {
        // cancel subscribe, avoid trigger self
        unSubscribeRef?.();

        _setCache(cacheKey, {
          data,
          params: fetchInstance.state.params,
          time: new Date().getTime(),
        });

        // resubscribe
        unSubscribeRef = subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
  };
};

export default useCachePlugin;
