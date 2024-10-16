declare type returnItemBaseType = {
	// 当前界面url
	url: string;
	// 类型
	type: "ErrorEvent" | "ErrorResource" | "lcp" | "userEvent";
	// 类型下的名称
	name?: string;

	extraInfo?: any;
	children?: returnItemBaseType[];

	user?: {
		ua: any;
		user: any;
	};
};
