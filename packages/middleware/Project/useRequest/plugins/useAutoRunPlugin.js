import { EventBusCase } from "../utils/eventBus.js";
/**
 * @des init param && monitor change
 * @param fetchInstance
 * @param param1
 * @returns
 */
const useAutoRunPlugin = (fetchInstance, { manual, ready = true, defaultParams = [], refreshDeps = [], refreshDepsAction, }) => {
    let hasAutoRun = false;
    EventBusCase.on("ready", (readyVal) => {
        if (!manual && readyVal) {
            hasAutoRun = true;
            fetchInstance.run(...defaultParams);
        }
    });
    if (refreshDeps.length) {
        EventBusCase.on("refreshDeps", (readyVal) => {
            if (hasAutoRun) {
                return;
            }
            if (!manual) {
                if (refreshDepsAction) {
                    refreshDepsAction();
                }
                else {
                    fetchInstance.refresh();
                }
            }
        });
    }
    return {
        onBefore: () => {
            if (!ready) {
                return { stopNow: true };
            }
        },
    };
};
useAutoRunPlugin.onInit = ({ ready = true, manual }) => {
    return {
        loading: !manual && ready,
    };
};
export default useAutoRunPlugin;
