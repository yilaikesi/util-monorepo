import axios from "axios";
const isFunction = (param) => {
    return Object.prototype.toString.call(param) === "[object Function]";
};
export class VAxios {
    axiosInstance;
    options;
    constructor(options) {
        this.options = options;
        this.axiosInstance = axios.create(options);
        this.setupInterceptors();
    }
    setupInterceptors() {
        const { options: { transform }, } = this;
        if (!transform) {
            return;
        }
        let { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch, } = transform;
        if (!(requestInterceptors && isFunction(requestInterceptors))) {
            requestInterceptors = (reqConfig) => {
                return reqConfig;
            };
        }
        if (!(requestInterceptorsCatch && isFunction(requestInterceptorsCatch))) {
            requestInterceptorsCatch = (reqCatch) => {
                // eslint-disable-next-line no-console
                console.warn("req-error-catch:", reqCatch);
            };
        }
        if (!(responseInterceptors && isFunction(responseInterceptors))) {
            responseInterceptors = (resConfig) => {
                return resConfig;
            };
        }
        if (!(responseInterceptorsCatch && isFunction(responseInterceptorsCatch))) {
            responseInterceptorsCatch = (reqCatch) => {
                console.warn("res-error-catch:", reqCatch);
            };
        }
        this.axiosInstance.interceptors.request.use(requestInterceptors, requestInterceptorsCatch);
        this.axiosInstance.interceptors.response.use(responseInterceptors, responseInterceptorsCatch);
    }
    get(config) {
        return this.axiosInstance.request({ ...config, method: "GET" });
    }
    post(config) {
        return this.axiosInstance.request({ ...config, method: "POST" });
    }
    put(config) {
        return this.axiosInstance.request({ ...config, method: "PUT" });
    }
    delete(config) {
        return this.axiosInstance.request({ ...config, method: "DELETE" });
    }
}
// sso实例配置,额外实例参考下面进行配置
const createSSOAxiosApi = () => {
    return new VAxios({
        baseURL: "/ssoapi",
        timeout: 5000,
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        transform: {
            requestInterceptors(config) {
                // console.log("拦截器", config)
                return config;
            },
        },
    });
};
export const ssoHttp = createSSOAxiosApi();
