// 单个 这是一种二层包装函数式分离中间件的思想
// 创造插件
// 创造组件
// 插件写入自己配置
// 将 插件和组件根据 key连接在一起
// 实例化的时候可以用自己的配置覆盖插件配置
// 最后返回 array<plugin>
function createFactory(obj) {
	return (override) => {
		return {
			...obj,
			...override,
		};
	};
}

// 集合
function createPlugins(plugins, { components }) {
	let allOverrideByKey = {};

	Object.keys(components).forEach((key) => {
		if (!allOverrideByKey[key]) {
			allOverrideByKey[key] = {};
		}

		allOverrideByKey[key].component = components[key];
	});

	return plugins.map((plugin) => {
		console.log(plugin, allOverrideByKey);
		return {
			...plugin,
			...allOverrideByKey[plugin.key],
		};
	});
}

let plugin = createFactory({
	key: "comp1",
	name: "xiaoming",
});

let components = {
	comp1: "假装是一个组件",
};
let plugins = createPlugins(
	[
		// 这个地方可以用config进行覆盖
		plugin({ name: "覆盖" }),
	],
	{
		components,
	}
);

console.log(plugin({ name: "覆盖" }), plugins);
