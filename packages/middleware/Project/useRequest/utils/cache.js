const cache = new Map();
export const setCache = (key, cacheTime, cachedData) => {
    const currentCache = cache.get(key);
    if (currentCache?.timer) {
        clearTimeout(currentCache.timer);
    }
    let timer = undefined;
    if (cacheTime > -1) {
        // if cache out, clear it
        timer = setTimeout(() => {
            cache.delete(key);
        }, cacheTime);
    }
    cache.set(key, {
        ...cachedData,
        timer,
    });
};
export const getCache = (key) => {
    return cache.get(key);
};
export const clearCache = (key) => {
    if (key) {
        const cacheKeys = Array.isArray(key) ? key : [key];
        cacheKeys.forEach((cacheKey) => cache.delete(cacheKey));
    }
    else {
        cache.clear();
    }
};
