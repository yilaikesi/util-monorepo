function QsString(ob: Record<any, any>) {
	let res = "";
	for (let i in ob) {
		res += `${i}=${ob[i]}&`;
	}
	res = res.substring(0, res.length - 1);
	return res;
}

const handleReqData = (config) => {
	if (config.method.toUpperCase() == "GET") {
		if (
			config.data &&
			Object.prototype.toString.call(config.data) !== "[object Object]"
		) {
			console.error("注意传参需要json && 请用param传参");
		}

		config.url = QsString(config.data)
			? config.url + "?" + QsString(config.data)
			: config.url;
		Reflect.deleteProperty(config, "body");
	} else if (config.method.toUpperCase() == "POST") {
		// post中区分文件 和 普通data
		if (Object.prototype.toString.call(config.data) == "[object FormData]") {
			config.body = config.data;
		} else {
			config.body = JSON.stringify(config.data);
		}
	}
	return config;
};

const handleReqUrl = (config: CreateAxiosOptions): any => {
	let trueReqUrl = (config.baseURL ?? "") + config.url ?? "";
	return [trueReqUrl, config];
};

/**
 * @des 组装首次返回的东西
 * @param result
 * @param config 属于axiosInstance
 * @param axiosInstance
 * @returns
 */
async function handleReturnType(result, config: CreateAxiosOptions) {
	// 进行错误处理 单次的fetch.catch 并没有用 404 之类的错误可以在这里处理
	let { status, statusText, ok } = result;

	let baseResult: AxiosResponse = {
		data: null,
		status,
		statusText,
		headers: config.headers,
		config,
		ok,
	};

	if (!result.ok) {
		return baseResult;
	}
	if (config?.responseOptions?.type == "json") {
		let seData = await result.json();
		baseResult["data"] = seData;
	}
	if (config?.responseOptions?.type == "text") {
		let seData = await result.text();
		baseResult["data"] = seData;
	}
	if (config?.responseOptions?.type == "native") {
		let seData = await result;
		baseResult["data"] = seData;
	}

	return baseResult;
}

const easy = (url, config) => {
	return new Promise((resolve, reject) => {
		fetch(url, config)
			.then((e) => {
				resolve(e);
			})
			.catch((e) => {
				reject(e);
			});
	});
};

export const isFunction = (param) => {
	return Object.prototype.toString.call(param) == "[object Function]";
};

export class easyFetch {
	config;
	constructor(config: CreateAxiosOptions) {
		this.config = config;
	}
	create(config: CreateAxiosOptions) {
		this.config = config;
	}
	setTransform(config: CreateAxiosOptions["transform"]) {
		this.config.transform = config;
	}

	/**
	 * @des 基类方法
	 * @param config
	 * @returns
	 */
	async request<T = any>(config: CreateAxiosOptions): Promise<T> {
		// 0.组合数据
		config = { ...this.config, ...config };
		// 1.处理请求数据
		config = handleReqData(config);
		let axiosInstance = {
			config: {
				...config,
				url: config.url,
			},
			request: this.request.bind(this),
		};
		let {
			requestInterceptors,
			requestInterceptorsCatch,
			responseInterceptors,
			responseInterceptorsCatch,
		} = config?.transform ?? {};

		return new Promise(async (resolve, reject) => {
			// 2.请求拦截
			if (isFunction(requestInterceptors)) {
				config = requestInterceptors(axiosInstance, config) ?? config;
			}

			// 3.处理baseUrl 并且进行拦截器的处理
			let [reqUrl, reqConfig] = handleReqUrl(config);
			let result;
			let reqError;
			try {
				result = await easy(reqUrl, reqConfig);
			} catch (e) {
				// 错误处理"域名没有解析走这里
				reqError = e;
			}
			// 4.处理返回值的拦截器 错误处理 404 走这里
			let resError;
			try {
				result = (await handleReturnType(result, config)) || result;
			} catch (e) {
				resError = e;
			}
			// result 没有值是 url解析错误
			if (!result) {
				result = {
					data: null,
					status: 400,
					statusText: reqError,
					headers: config.headers,
					config,
					ok: false,
				};
			}
			if (isFunction(requestInterceptorsCatch) && !result?.ok && reqError) {
				// requestInterceptorsCatch(axiosInstance, new Error(result), result);
			}
			if (isFunction(responseInterceptorsCatch) && !result?.ok && resError) {
				responseInterceptorsCatch(axiosInstance, new Error(result), result);
			} else if (isFunction(responseInterceptors)) {
				result = responseInterceptors(axiosInstance, result) ?? result;
			}
			if (!result?.ok) {
				return reject(result);
			}
			return resolve(result);
		});
	}
}
