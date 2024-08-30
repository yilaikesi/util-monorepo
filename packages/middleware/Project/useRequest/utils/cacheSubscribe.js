const listeners = {};
export const trigger = (key, data) => {
    if (listeners[key]) {
        listeners[key].forEach((item) => item(data));
    }
};
export const subscribe = (key, listener) => {
    if (!listeners[key]) {
        listeners[key] = [];
    }
    listeners[key].push(listener);
    return function unsubscribe() {
        const index = listeners[key].indexOf(listener);
        listeners[key].splice(index, 1);
    };
};
