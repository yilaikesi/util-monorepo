const useLoadingDelayPlugin = (fetchInstance, { loadingDelay, ready }) => {
    let timerRef = null;
    // 加载延迟
    if (!loadingDelay) {
        return {};
    }
    const cancelTimeout = () => {
        if (timerRef) {
            clearTimeout(timerRef);
        }
    };
    return {
        onBefore: () => {
            cancelTimeout();
            // Two cases:
            // 1. ready === undefined
            // 2. ready === true
            if (ready !== false) {
                timerRef = setTimeout(() => {
                    fetchInstance.setState({ loading: true });
                }, loadingDelay);
            }
            return { loading: false };
        },
        onFinally: () => {
            cancelTimeout();
        },
        onCancel: () => {
            cancelTimeout();
        },
    };
};
export default useLoadingDelayPlugin;
