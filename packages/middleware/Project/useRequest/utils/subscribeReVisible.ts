import { isBrowser } from "./isBrowser.js";
import { isDocumentVisible } from "./isDocumentVisible.js";

type Listener = () => void;

const listeners: Listener[] = [];

if (isBrowser) {
	const revalidate = () => {
		if (!isDocumentVisible()) return;
		for (let i = 0; i < listeners.length; i++) {
			const listener = listeners[i];
			listener();
		}
	};
	window.addEventListener("visibilitychange", revalidate, false);
}

export default function subscribe(listener: Listener) {
	listeners.push(listener);
	return function unsubscribe() {
		const index = listeners.indexOf(listener);
		listeners.splice(index, 1);
	};
}
