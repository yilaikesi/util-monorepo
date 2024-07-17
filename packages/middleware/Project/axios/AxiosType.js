export class AxiosTransform {
    /**
     * @description: 请求之前的拦截器
     */
    requestInterceptors;
    /**
     * @description: 请求之后的拦截器
     */
    responseInterceptors;
    /**
     * @description: 请求之前的拦截器错误处理
     */
    requestInterceptorsCatch;
    /**
     * @description: 请求之后的拦截器错误处理
     */
    responseInterceptorsCatch;
}
