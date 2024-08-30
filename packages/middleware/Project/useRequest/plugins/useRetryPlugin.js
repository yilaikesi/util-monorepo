const useRetryPlugin = (fetchInstance, { retryInterval, retryCount }) => {
    // debugger;
    let timerRef = null;
    let countRef = 0;
    let triggerByRetry = null;
    if (!retryCount) {
        return {};
    }
    return {
        onBefore: () => {
            if (!triggerByRetry) {
                countRef = 0;
            }
            triggerByRetry = false;
            if (timerRef) {
                clearTimeout(timerRef);
            }
        },
        onSuccess: () => {
            countRef = 0;
        },
        onError: () => {
            countRef += 1;
            if (retryCount === -1 || countRef <= retryCount) {
                // Exponential backoff
                const timeout = retryInterval ?? Math.min(1000 * 2 ** countRef, 30000);
                timerRef = setTimeout(() => {
                    triggerByRetry = true;
                    fetchInstance.refresh();
                }, timeout);
            }
            else {
                countRef = 0;
            }
            console.log("重试");
        },
        onCancel: () => {
            countRef = 0;
            if (timerRef) {
                clearTimeout(timerRef);
            }
        },
    };
};
export default useRetryPlugin;
