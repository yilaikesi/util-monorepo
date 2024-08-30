import { isBrowser } from "./isBrowser.js";
export function isDocumentVisible() {
    if (isBrowser) {
        return document.visibilityState !== "hidden";
    }
    return true;
}
