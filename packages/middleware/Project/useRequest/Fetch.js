import { isFunction } from "./utils/isFunction.js";
export default class Fetch {
    serviceRef;
    options;
    subscribe;
    initState;
    pluginImpls = [];
    count = 0;
    state = {
        loading: false,
        params: undefined,
        data: undefined,
        error: undefined,
    };
    constructor(serviceRef, options, subscribe, initState = {}) {
        this.serviceRef = serviceRef;
        this.options = options;
        this.subscribe = subscribe;
        this.initState = initState;
        if (options.subscribe) {
            this.subscribe = options.subscribe;
        }
        this.setState({ loading: !options.manual, ...initState });
    }
    setState(s = {}) {
        Object.assign(this.state, s);
        this.subscribe(this);
    }
    // 通知插件进行订阅 | 本质上不要求返回值
    runPluginHandler(event, ...rest) {
        const r = this.pluginImpls
            .map((i) => {
            console.log("event:", event, rest);
            // @ts-ignore
            return i[event]?.(...rest);
        })
            .filter(Boolean);
        return Object.assign({}, ...r);
    }
    async runAsync(...params) {
        this.count += 1;
        const currentCount = this.count;
        const { stopNow = false, returnNow = false, ...state } = this.runPluginHandler("onBefore", params);
        // stop request
        if (stopNow) {
            return new Promise(() => { });
        }
        this.setState({
            loading: true,
            params,
            ...state,
        });
        // return now
        if (returnNow) {
            return Promise.resolve(state.data);
        }
        this.options.onBefore?.(params);
        try {
            // replace service
            let { servicePromise } = this.runPluginHandler("onRequest", this.serviceRef, params);
            if (!servicePromise) {
                servicePromise = this.serviceRef(...params);
            }
            const res = await servicePromise;
            if (currentCount !== this.count) {
                // prevent run.then when request is canceled
                // 返回最后请求的东西
                return new Promise(() => { });
            }
            this.setState({ data: res, error: undefined, loading: false });
            this.options.onSuccess?.(res, params);
            this.runPluginHandler("onSuccess", res, params);
            this.options.onFinally?.(params, res, undefined);
            if (currentCount === this.count) {
                this.runPluginHandler("onFinally", params, res, undefined);
            }
            return res;
        }
        catch (error) {
            if (currentCount !== this.count) {
                // prevent run.then when request is canceled
                return new Promise(() => { });
            }
            this.setState({ error, loading: false });
            this.options.onError?.(error, params);
            this.runPluginHandler("onError", error, params);
            this.options.onFinally?.(params, undefined, error);
            if (currentCount === this.count) {
                this.runPluginHandler("onFinally", params, undefined, error);
            }
            throw error;
        }
    }
    // 通过run 来进行代理
    run(...params) {
        this.runAsync(...params).catch((error) => {
            if (!this.options.onError) {
                console.error(error);
            }
        });
    }
    cancel() {
        this.count += 1;
        this.setState({ loading: false });
        this.runPluginHandler("onCancel");
    }
    refresh() {
        // @ts-ignore
        this.run(...(this.state.params || []));
    }
    refreshAsync() {
        // @ts-ignore
        return this.runAsync(...(this.state.params || []));
    }
    mutate(data) {
        const targetData = isFunction(data) ? data(this.state.data) : data;
        this.runPluginHandler("onMutate", targetData);
        this.setState({ data: targetData });
    }
}
