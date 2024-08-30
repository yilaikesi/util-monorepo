import { isBrowser } from "./isBrowser.js";

export function isOnline(): boolean {
	if (isBrowser && typeof navigator.onLine !== "undefined") {
		return navigator.onLine;
	}
	return true;
}
