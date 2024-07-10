import type { AxiosRequestConfig, AxiosInstance } from "axios"
import axios from "axios"
import type { VAxiosOptionType } from "./AxiosType"

const isFunction = (param: unknown) => {
	return Object.prototype.toString.call(param) === "[object Function]"
}

export class VAxios {
	private axiosInstance: AxiosInstance

	private readonly options: VAxiosOptionType

	constructor(options: VAxiosOptionType) {
		this.options = options
		this.axiosInstance = axios.create(options)
		this.setupInterceptors()
	}

	setupInterceptors() {
		const {
			options: { transform },
		} = this
		if (!transform) {
			return
		}
		let {
			requestInterceptors,
			requestInterceptorsCatch,
			responseInterceptors,
			responseInterceptorsCatch,
		} = transform

		if (!(requestInterceptors && isFunction(requestInterceptors))) {
			requestInterceptors = (reqConfig) => {
				return reqConfig
			}
		}

		if (!(requestInterceptorsCatch && isFunction(requestInterceptorsCatch))) {
			requestInterceptorsCatch = (reqCatch) => {
				// eslint-disable-next-line no-console
				console.warn("req-error-catch:", reqCatch)
			}
		}

		if (!(responseInterceptors && isFunction(responseInterceptors))) {
			responseInterceptors = (resConfig) => {
				return resConfig
			}
		}

		if (!(responseInterceptorsCatch && isFunction(responseInterceptorsCatch))) {
			responseInterceptorsCatch = (reqCatch) => {
				console.warn("res-error-catch:", reqCatch)
			}
		}
		this.axiosInstance.interceptors.request.use(requestInterceptors, requestInterceptorsCatch)
		this.axiosInstance.interceptors.response.use(
			responseInterceptors,
			responseInterceptorsCatch,
		)
	}

	get<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.axiosInstance.request({ ...config, method: "GET" })
	}

	post<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.axiosInstance.request({ ...config, method: "POST" })
	}

	put<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.axiosInstance.request({ ...config, method: "PUT" })
	}

	delete<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.axiosInstance.request({ ...config, method: "DELETE" })
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
				return config
			},
		},
	})
}

export const ssoHttp = createSSOAxiosApi()
