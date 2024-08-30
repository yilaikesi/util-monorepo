import { isBrowser } from "./isBrowser.js";

export function isDocumentVisible(): boolean {
	if (isBrowser) {
		return document.visibilityState !== "hidden";
	}
	return true;
}
