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

function setState(nextState: SessionState): Promise<void> {
	state = nextState;

	return new Promise((resolve) => {
		chrome.storage.session.set({[STORAGE_KEY]: nextState}, () => {
			// console.log(state!.lastActiveTabId);
			console.log(JSON.stringify(state!, null, '\t'));
			resolve();
		});
	});
}

/* -------------------- ACTIVE TAB TRACKING -------------------- */

function updateActiveTab(tabId: number): Promise<void> {
	return runExclusive(async () => {
		const current = await getState();

		const next: SessionState = {
			...current,
			lastActiveTabId: tabId,
		};
		console.clear();
		console.log('Active tab:', tabId);

		await setState(next);
	});
}

chrome.tabs.onActivated.addListener((activeInfo) => {
	updateActiveTab(activeInfo.tabId);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
	if (windowId === chrome.windows.WINDOW_ID_NONE) return;

	chrome.tabs.query({active: true, windowId}, function (tabs) {
		const tabId = tabs[0]?.id;
		if (tabId === undefined) return;

		updateActiveTab(tabId);
	});
});

/* -------------------- TAB CREATED -------------------- */

chrome.tabs.onCreated.addListener((tab) => {
	runExclusive(async () => {
		if (tab.id == null) return;

		const state = await getState();

		console.clear();
		console.log(`opener id: ${tab.openerTabId}`);
		console.log(`or from state: ${state.lastActiveTabId}`);

		// const refererId = state.lastActiveTabId;
		const refererId = tab.openerTabId ?? state.lastActiveTabId;

		if (refererId != null) {
			state.graph[tab.id] = refererId;
		}

		state.lastActiveTabId = tab.id;

		await setState(state);
	});
});

/* -------------------- TAB REMOVED -------------------- */

chrome.tabs.onRemoved.addListener((tabId) => {
	runExclusive(async () => {
		const state = await getState();

		const parent = state.graph[tabId];

		console.log(`deletion`);
		console.log(`parent: ${parent}`);

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
			chrome.tabs.get(parent, (tab) => {
				if (chrome.runtime.lastError || !tab) return;
				chrome.tabs.update(parent, {active: true});
			});
		}

		await setState(state);
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

init();
