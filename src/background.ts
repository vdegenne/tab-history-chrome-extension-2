import {Debouncer} from '@vdegenne/debouncer';
import {
	cancelLastPush,
	focusPreviousTab,
	pushId,
	removeId,
} from './active-tab-history.js';

type TabGraph = {
	[tabId: number]: number;
};

type SessionState = {
	lastActiveTabId: number | null;
	graph: TabGraph;
};

const STORAGE_KEY = 'tab_state';

/**
 * Pour debugger
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message?.type === 'GET_TAB_ID') {
		sendResponse({tabId: sender.tab?.id});
	}
});

/**
 * For the focus-previous-tab shortcut
 */
chrome.commands.onCommand.addListener(function (command) {
	if (command === 'focus-previous-tab') {
		focusPreviousTab();
	}
});

/* -------------------- SERIALIZATION QUEUE -------------------- */

let queue: Promise<any> = Promise.resolve();

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
	const result = queue.then(() => fn());

	queue = result.catch(() => {});

	return result;
}

/* -------------------- STORAGE -------------------- */

let state: SessionState | null = null;
let statePromise: Promise<SessionState> | null = null;

function getState(): Promise<SessionState> {
	if (state) return Promise.resolve(state);

	if (statePromise) return statePromise;

	statePromise = new Promise((resolve) => {
		chrome.storage.session.get(STORAGE_KEY, (res) => {
			state = (res[STORAGE_KEY] as SessionState | null) ?? {
				lastActiveTabId: null,
				graph: {},
			};

			statePromise = null;
			resolve(state);
		});
	});

	return statePromise;
}

const saveStateDebouncer = new Debouncer(
	(state: SessionState) => chrome.storage.session.set({[STORAGE_KEY]: state}),
	10,
);

async function debugShowState() {
	const state = await getState();
	const {graph} = state;
	const entries = Object.entries(graph);
	const lastFive = Object.fromEntries(entries.slice(-5));
	console.log(
		JSON.stringify(
			{lastActiveTabId: state.lastActiveTabId, graph: lastFive},
			null,
			'\t',
		),
	);
}

function setState(nextState: SessionState): Promise<void> {
	state = nextState;

	// return new Promise((resolve) => {
	// 	chrome.storage.session.set({[STORAGE_KEY]: nextState}, () => {
	// 		// console.log(state!.lastActiveTabId);
	// 		// console.log(JSON.stringify(state!, null, '\t'));
	// 		resolve();
	// 	});
	// });

	// TODO: return this instead if it bugs (but it will be blocking)
	saveStateDebouncer.call(nextState);

	return Promise.resolve();
}

/* -------------------- ACTIVE TAB TRACKING -------------------- */

async function updateActiveTab(tabId: number): Promise<void> {
	const current = await getState();

	if (current.lastActiveTabId === tabId) {
		return;
	}

	// console.log(`=============== UPDATE ACTIVE TAB (${tabId}) ===============`);

	const next: SessionState = {
		...current,
		lastActiveTabId: tabId,
	};

	pushId(tabId); // history (debounced, see module)

	await setState(next);
}
const updateActiveTabDebouncer = new Debouncer(
	(tabId: number) => updateActiveTab(tabId),
	100,
);

chrome.tabs.onActivated.addListener((activeInfo) => {
	runExclusive(async () => {
		await updateActiveTab(activeInfo.tabId);
		// updateActiveTabDebouncer.call(activeInfo.tabId)
	});
});

chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId === chrome.windows.WINDOW_ID_NONE) return;

	runExclusive(async () => {
		const tabs = await chrome.tabs.query({
			active: true,
			windowId,
		});

		const tabId = tabs[0]?.id;
		if (tabId === undefined) return;

		await updateActiveTab(tabId);
		// updateActiveTabDebouncer.call(tabId)
	});
});

/* -------------------- TAB CREATED -------------------- */

chrome.tabs.onCreated.addListener((tab) => {
	if (tab.id) {
		cancelLastPush();
		pushId(tab.id, {immediate: true}); // history
	}

	runExclusive(async () => {
		// console.log(`=============== TAB CREATED (${tab.id}) ===============`);
		if (tab.id == null) return;

		const state = await getState();

		// console.log(`last active tab id: ${state.lastActiveTabId}`);
		// console.log(`opener id: ${tab.openerTabId}`);

		// const refererId = state.lastActiveTabId;
		const refererId = tab.openerTabId ?? state.lastActiveTabId;

		if (refererId != null) {
			state.graph[tab.id] = refererId;
		}

		state.lastActiveTabId = tab.id;

		await setState(state);

		// await debugShowState();
	});
});

/* -------------------- TAB REMOVED -------------------- */

chrome.tabs.onRemoved.addListener((tabId) => {
	removeId(tabId); // history (not debounced, see module)

	runExclusive(async () => {
		// console.log(`=============== TAB DELETED (${tabId}) ===============`);
		const state = await getState();

		const parent = state.graph[tabId];

		// console.log(`parent: ${parent}`);

		// 1. supprimer le node
		delete state.graph[tabId];

		if (parent != null) {
			// 2. reconnecter tous les enfants de tabId vers parent
			for (const [childIdStr, p] of Object.entries(state.graph)) {
				const childId = Number(childIdStr);

				if (p === tabId) {
					state.graph[childId] = parent;
				}
			}

			// 3. focus fallback
			// chrome.tabs.get(parent, (tab) => {
			// 	if (chrome.runtime.lastError || !tab) return;
			// 	chrome.tabs.update(parent, {active: true});
			// });
			try {
				await chrome.tabs.update(parent, {active: true});
				// TODO ?
				state.lastActiveTabId = parent;
			} catch (e) {}
		}

		await setState(state);

		// await debugShowState();
	});
});

/* -------------------- INIT -------------------- */

function init(): void {
	chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
		const active = tabs[0];
		if (!active?.id) return;

		runExclusive(async () => {
			const state = await getState();

			state.lastActiveTabId = active.id ?? null;

			await setState(state);
		});
	});
}

// init();
