type TabGraph = {
	[tabId: number]: number;
};

type SessionState = {
	lastActiveTabId: number | null;
	graph: TabGraph;
};

const STORAGE_KEY = 'tab_state';

/* -------------------- SERIALIZATION QUEUE -------------------- */

let queue: Promise<any> = Promise.resolve();

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
	queue = queue.then(fn, fn);
	return queue;
}

/* -------------------- STORAGE -------------------- */

function getState(): Promise<SessionState> {
	return new Promise((resolve) => {
		chrome.storage.session.get(STORAGE_KEY, (res) => {
			const state = res[STORAGE_KEY] as SessionState | undefined;

			resolve(
				state ?? {
					lastActiveTabId: null,
					graph: {},
				},
			);
		});
	});
}

function setState(state: SessionState): Promise<void> {
	return new Promise((resolve) => {
		chrome.storage.session.set({[STORAGE_KEY]: state}, () => {
			resolve();
		});
	});
}

/* -------------------- ACTIVE TAB TRACKING -------------------- */

function updateActiveTab(tabId: number): Promise<void> {
	return runExclusive(async () => {
		const state = await getState();

		state.lastActiveTabId = tabId;

		await setState(state);
	});
}

chrome.tabs.onActivated.addListener((activeInfo) => {
	updateActiveTab(activeInfo.tabId);
});

/* -------------------- TAB CREATED -------------------- */

chrome.tabs.onCreated.addListener((tab) => {
	runExclusive(async () => {
		if (tab.id == null) return;

		const state = await getState();

		const refererId = state.lastActiveTabId;

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

		const refererId = state.graph[tabId];

		delete state.graph[tabId];

		await setState(state);

		if (refererId != null) {
			chrome.tabs.get(refererId, (tab) => {
				if (chrome.runtime.lastError || !tab) return;

				chrome.tabs.update(refererId, {active: true});
			});
		}
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
