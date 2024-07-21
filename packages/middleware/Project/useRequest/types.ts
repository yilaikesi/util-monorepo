import Fetch from "./Fetch";

// 这里 TParams 通过 传参 传递到 run 的约束
export type Service<TData, TParams extends any[]> = (
	...args: TParams
) => Promise<TData>;
export type Subscribe = (...arg: any) => void;

// for Fetch
export interface FetchState<TData, TParams extends any[]> {
	loading: boolean;
	params?: TParams;
	data?: TData;
	error?: Error;
}

export interface PluginReturn<TData, TParams extends any[]> {
	onBefore?: (params: TParams) =>
		| ({
				stopNow?: boolean;
				returnNow?: boolean;
		  } & Partial<FetchState<TData, TParams>>)
		| void;

	onRequest?: (
		service: Service<TData, TParams>,
		params: TParams
	) => {
		servicePromise?: Promise<TData>;
	};

	onSuccess?: (data: TData, params: TParams) => void;
	onError?: (e: Error, params: TParams) => void;
	onFinally?: (params: TParams, data?: TData, e?: Error) => void;
	onCancel?: () => void;
	onMutate?: (data: TData) => void;
}

export interface CachedData<TData = any, TParams = any> {
	data: TData;
	params: TParams;
	time: number;
  }


// for useRequestImplement
export interface UseRequestOptions<TData, TParams extends any[]> {
	onBefore?: (params: TParams) => void;
	onSuccess?: (data: TData, params: TParams) => void;
	onError?: (e: Error, params: TParams) => void;
	// formatResult?: (res: any) => TData;
	onFinally?: (params: TParams, data?: TData, e?: Error) => void;

	subscribe?: (useRequestInstance: Fetch<TData, TParams>) => void;

	defaultParams?: TParams;

	manual?: boolean;
	// refreshDeps
	refreshDeps?: Array<any>;
	refreshDepsAction?: () => void;

	// loading delay
	loadingDelay?: number;

	// polling
	pollingInterval?: number;
	pollingWhenHidden?: boolean;
	pollingErrorRetryCount?: number;

	// refresh on window focus
	refreshOnWindowFocus?: boolean;
	focusTimespan?: number;

	// debounce
	debounceWait?: number;
	debounceLeading?: boolean;
	debounceTrailing?: boolean;
	debounceMaxWait?: number;

	// throttle
	throttleWait?: number;
	throttleLeading?: boolean;
	throttleTrailing?: boolean;

	// cache
	cacheKey?: string;
	cacheTime?: number;
	staleTime?: number;
	setCache?: (data: CachedData<TData, TParams>) => void;
	getCache?: (params: TParams) => CachedData<TData, TParams> | undefined;
  
	// retry
	retryCount?: number;
	retryInterval?: number;

	// [key: string]: any;
	ready?: boolean;
}

export interface UseRequestPlugin<TData, TParams extends any[]> {
	// eslint-disable-next-line prettier/prettier
	(
		fetchInstance: any,
		options: UseRequestOptions<TData, TParams>
	): PluginReturn<TData, TParams>;
	onInit?: (
		options: UseRequestOptions<TData, TParams>
	) => Partial<FetchState<TData, TParams>>;
}

// for index
// export type OptionsWithoutFormat<TData, TParams extends any[]> = Omit<Options<TData, TParams>, 'formatResult'>;

// export interface OptionsWithFormat<TData, TParams extends any[], TFormated, TTFormated extends TFormated = any> extends Omit<Options<TTFormated, TParams>, 'formatResult'> {
//   formatResult: (res: TData) => TFormated;
// };

export interface UseRequestResult<TData, TParams extends any[]> {
	loading: boolean;
	data: TData;
	error: Error;
	params: TParams;

	cancel: Fetch<TData, TParams>["cancel"];
	refresh: Fetch<TData, TParams>["refresh"];
	refreshAsync: Fetch<TData, TParams>["refreshAsync"];
	run: Fetch<TData, TParams>["run"];
	runAsync: Fetch<TData, TParams>["runAsync"];
	mutate: Fetch<TData, TParams>["mutate"];
}

export type UseRequestTimeout = ReturnType<typeof setTimeout>;
