export function useScript(opts) {
    let isLoading = false;
    let error = false;
    let success = false;
    let script;
    let promise = new Promise((resolve, reject) => {
        () => {
            script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = function () {
                isLoading = false;
                success = true;
                error = false;
                resolve("");
            };
            script.onerror = function (err) {
                isLoading = false;
                success = false;
                error = true;
                reject(err);
            };
            script.src = opts.src;
            document.head.appendChild(script);
        };
    });
    return {
        isLoading,
        error,
        success,
        toPromise: () => promise,
    };
}
