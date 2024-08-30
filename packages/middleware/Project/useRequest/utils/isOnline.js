import { isBrowser } from "./isBrowser.js";
export function isOnline() {
    if (isBrowser && typeof navigator.onLine !== "undefined") {
        return navigator.onLine;
    }
    return true;
}
