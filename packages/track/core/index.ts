import { getUser } from "./util.js";

interface BaseType {
	trackSend?: any;
	trackConfig?: Record<any, any>;
}

interface TrackingConfigType<t extends Record<string, any>> {
	// 插件集合 | class 的 集合
	plugins?: t;
	// 初始化基本配置
	config?: {
		// 用户标识/信息
		user?: Record<"name" | "data", any>;
		app?: Record<"name" | "data", any>;
		autoRun?: boolean
	};
	reportConfig: {
		// 上传地址
		baseUrl?: string;
		type?: "beacon" | "image" | "debug";
	};
}
function QsString(ob: Record<any, any>) {
	let res = "?";
	for (let i in ob) {
		res += `${i}=${ob[i]}&`;
	}
	res = res.substring(0, res.length - 1);
	return res;
}


function QsObj(split, ob) {
	let text = ob.split(split).at(-1)?.split("&");
	let res = {};
	for (let i in text) {
		let temp = text[i].split("=");
		res[temp[0]] = temp[1];
	}
	console.log("", res);
	return res;
}

/**
 * @f1 autoRun 自动注册
 * @f2 plugin 的 constructor 自动得到 trackConfig 和 trackSend({data,url})
 */
export class Tracking<t extends Record<string, any>> {
	TrackingConfig: TrackingConfigType<t>;
	enhanceFn: any = {};
	constructor(TrackingConfig: TrackingConfigType<t>) {
		this.TrackingConfig = TrackingConfig;
		this.autoRun();
	}
	/**
	 * @des 自动运行
	 */
	autoRun() {
		if(!this.TrackingConfig?.config?.autoRun){
			return
		}
		if (this.TrackingConfig.plugins) {
			for (let i in this.TrackingConfig.plugins) {
				this.enhanceFn[i] = new (this.TrackingConfig!.plugins![i] as any)({
					trackSend: this.trackSend(),
					trackConfig: this.TrackingConfig,
				});
				this.enhanceFn[i].autoRun();
			}
		}
	}
	pluginGet<k extends keyof t>(plugin: k) {
		console.log("plugin:", plugin);
		return this.enhanceFn[plugin] as InstanceType<t[k]>;
	}
	trackSend() {
		let baseUrl = this.TrackingConfig?.reportConfig?.baseUrl;
		let method = this.TrackingConfig?.reportConfig?.type;
		if(method == "debug") return (jsonDebug)=>{
			console.log('%c ' + JSON.stringify(jsonDebug, null, 2), 'color: blue; font-family: monospace;  border-radius: 5px;');
		}
		if(!baseUrl || !method) return null
		return async ({ data, url = "" }) => {
			// let user = await getUser({ getIp: false });
			// console.log("调用监控:", { data, user });
			if (method == "beacon") {
				let handleData;
				if (
					Object.prototype.toString.call(data) == "[object Object]" ||
					Object.prototype.toString.call(data) == "[object Array]"
				) {
					handleData = JSON.stringify({ user: null, data: data });
					for (let i = 0; i < 10000; i++) {
						handleData = handleData + "8996589";
					}
					let is = navigator.sendBeacon(baseUrl, handleData);
					console.log("issend:", is);
				}
			}
			// 有可能上报失败
			if (method == "image") {
				let img = new Image();
				let handleData;
				if (
					Object.prototype.toString.call(data) == "[object Object]" ||
					Object.prototype.toString.call(data) == "[object Array]"
				) {
					handleData = "?data=" + JSON.stringify(data) // + "&user=" + user;
					img.src = baseUrl + url + handleData;
				}
			}
		};
	}
}
