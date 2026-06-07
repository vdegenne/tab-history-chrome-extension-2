import {Debouncer} from '@vdegenne/debouncer';

const STORAGE_KEY = 'history';
const HISTORY_LENGTH = 200;

let history: number[] | null = null;
let statePromise: Promise<number[]> | null = null;

function getState() {
	if (history) return Promise.resolve(history);

	if (statePromise) return statePromise;

	statePromise = new Promise((resolve) => {
		chrome.storage.session.get(STORAGE_KEY, (res) => {
			history = (res[STORAGE_KEY] as number[] | null) ?? [];
			statePromise = null;
			resolve(history);
		});
	});

	return statePromise;
}

function setState(state: number[]) {
	history = state;

	console.clear();
	console.log(JSON.stringify(history, null, '\t'));

	// save in chrome.storage.session
	chrome.storage.session.set({[STORAGE_KEY]: state});
}

async function _pushId(id: number) {
	// add in history
	const current = await getState();

	// do not update if the last is the same
	if (current[current.length - 1] === id) return;

	// avoid duplicates (optional but usually useful for tab history)
	const filtered = current.filter((x) => x !== id);

	// add new id at the end
	filtered.push(id);

	// enforce max length
	const trimmed = filtered.slice(-HISTORY_LENGTH);

	// set state
	setState(trimmed);
}
const pushDebouncer = new Debouncer(_pushId, 700);

export function pushId(id: number, options?: {immediate: boolean}) {
	if (options?.immediate) {
		_pushId(id);
	} else {
		pushDebouncer.call(id);
	}
}
export function cancelLastPush() {
	pushDebouncer.cancel();
}

export async function removeId(id: number) {
	const current = await getState();

	const filtered = current.filter((x) => x !== id);

	setState(filtered);
}

// Will be used by the background
export async function focusPreviousTab(currentTabId?: number) {
	if (currentTabId == null) {
		const [tab] = await chrome.tabs.query({
			active: true,
			lastFocusedWindow: true,
		});

		currentTabId = tab?.id;
	}

	const current = await getState();

	if (current.length < 2) return;

	const working = [...current];

	let startIndex = working.length - 2;

	if (
		currentTabId != null &&
		startIndex >= 0 &&
		working[startIndex] === currentTabId
	) {
		startIndex = working.length - 1;
	}

	for (let i = startIndex; i >= 0; i--) {
		const tabId = working[i];

		try {
			const tab = await chrome.tabs.update(tabId, {
				active: true,
			});

			if (tab?.windowId != null) {
				await chrome.windows.update(tab.windowId, {
					focused: true,
				});
			}

			working.splice(i, 1);
			working.push(tabId);

			break;
		} catch {
			working.splice(i, 1);
		}
	}

	setState(working.slice(-HISTORY_LENGTH));
}
