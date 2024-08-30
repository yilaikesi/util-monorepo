import Fetch from "./Fetch.js";
import useRetryPlugin from "./plugins/useRetryPlugin.js";
import useAutoRunPlugin from "./plugins/useAutoRunPlugin.js";
const service = (test) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.9) {
                resolve(test);
            }
            else {
                reject(test);
            }
            // resolve(test);
        }, test);
    });
};
let initState = {
    loading: true,
};
const useRequest = (service, options = {}, plugins = []) => {
    // fetchOptions:user config
    const { manual = false, ...rest } = options;
    let fetchOptions = {
        manual: false,
        ...rest,
    };
    let resPlugins = [
        useRetryPlugin,
        useAutoRunPlugin,
        ...plugins,
    ];
    let initState = resPlugins
        .map((p) => p?.onInit?.(fetchOptions))
        .filter(Boolean);
    const DefaultSubFn = (e) => {
        console.log("defaultSubscribe:", JSON.parse(JSON.stringify(e)));
    };
    const fetchInstance = new Fetch(service, fetchOptions, 
    // constructor | cancel | mutate | runAsync(初始化来一次loading )
    options.subscribe ?? DefaultSubFn, Object.assign({}, ...initState));
    fetchInstance.options = fetchOptions;
    // run all plugins hooks | casely
    // 重要:实例化参数
    // 插件如果需要使用 那么 map((e)=>{e[event](参数就可以了)})
    fetchInstance.pluginImpls = resPlugins.map((p) => {
        return p(fetchInstance, fetchOptions);
    });
    if (!manual) {
        const params = fetchInstance.state.params || options.defaultParams || [];
        // @ts-ignore
        fetchInstance.run(...params);
    }
    return {
        ...fetchInstance.state,
        cancel: fetchInstance.cancel.bind(fetchInstance),
        mutate: fetchInstance.mutate.bind(fetchInstance),
        refresh: fetchInstance.refresh.bind(fetchInstance),
        refreshAsync: fetchInstance.refreshAsync.bind(fetchInstance),
        run: fetchInstance.run.bind(fetchInstance),
        runAsync: fetchInstance.runAsync.bind(fetchInstance),
    };
};
import { easyFetch } from "./easyFetch.js";
let params = {
    params: {
        id: 5,
    },
    url: "/use333rs/Electroluxcode",
    method: "get",
};
let fetchHook = new easyFetch({
    responseOptions: {
        type: "json",
    },
    baseURL: "https://api.github.com",
});
const userGet = () => {
    return fetchHook.request(params);
};
let { loading, run } = useRequest(service, {
    manual: true,
    subscribe: (e) => {
        // if()
        // console.log("subscribe:", e);
    },
    onSuccess(data) {
        console.log("success:", data);
    },
    retryCount: 2,
    retryInterval: 1000,
});
setTimeout(() => {
    // 永远拿到的是后面发送的值，例如下面的例子 run 3秒后发射
    run(3000);
    // userGet().then((e) => {
    // 	console.log("测试", e);
    // });
}, 100);
