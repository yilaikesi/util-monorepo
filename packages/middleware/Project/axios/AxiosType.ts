/**
 * Data processing class, can be configured according to the project
 */
import type {
	AxiosRequestConfig,
	AxiosResponse,
	CreateAxiosDefaults,
	InternalAxiosRequestConfig,
} from "axios"

export interface CreateAxiosOptions extends AxiosRequestConfig {
	authenticationScheme?: string
	transform?: AxiosTransform
	requestOptions?: any
}

export type VAxiosOptionType = CreateAxiosDefaults & {
	transform: AxiosTransform
}
export abstract class AxiosTransform {
	/**
	 * @description: 请求之前的拦截器
	 */
	requestInterceptors?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig

	/**
	 * @description: 请求之后的拦截器
	 */
	responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>

	/**
	 * @description: 请求之前的拦截器错误处理
	 */
	requestInterceptorsCatch?: (error: Error) => void

	/**
	 * @description: 请求之后的拦截器错误处理
	 */
	responseInterceptorsCatch?: (error: Error) => void
}
