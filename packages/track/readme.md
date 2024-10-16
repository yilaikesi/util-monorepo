
## 基础使用

- 1. 引入基座包和插件包

基座包提供基础能力，能够统筹插件加载和执行

```js
 import { Tracking } from "../core/index.js";
 import { performancePlugin } from "../plugins/util/performancePlugin.js"

```

- 2. 定义基座包的 plugin/config/reportConfig 三个参数

```js
let t = new Tracking({
    plugins: {
        performancePlugin,
    },
    config: {
        autoRun: true,
    },
    reportConfig: {
        type: "debug" | "image" | "beaon",
    },
});
```

- 3. 





## 插件开发

插件应该是一个类，其基座能力会传递给插件。

- 插件内需要自行处理 上报时机
- 基座的数据会原封不动传递给 trackconfig

```js

export class performancePlugin {
	trackConfigData;
    static staticConfig
	constructor({trackSend, trackConfig} = { trackSend: () => {}, trackConfig: {} }) {
		this.trackConfigData = {
			trackSend, trackConfig
		};
	}
}

```



如果需要自定义传递给传输 plugin 的数据，推荐使用 performancePlugin.staticConfig 设置










## demo 

测试是打包后进行测试，可以先 在根路径上 npm run  build:track 然后 在 demo/test.html 中进行测试


## dev

本地环境进行安装。如果想用 workspace 的方式安装时,先加到 package.json 上面？

pnpm -f add  @util-monorepo/track-plugins

pnpm -f add  @util-monorepo/track-utils