function createOverlay(tabId: number): void {
	const el = document.createElement('div');

	el.style.position = 'fixed';
	// el.style.bottom = '10px';
	// el.style.left = '10px';
	el.style.bottom = '3px';
	el.style.right = '3px';
	el.style.zIndex = '999999';
	el.style.padding = '6px 10px';
	el.style.background = 'rgba(0, 0, 0, 0.75)';
	el.style.color = '#fff';
	el.style.fontSize = '12px';
	el.style.fontFamily = 'monospace';
	el.style.borderRadius = '6px';
	el.style.pointerEvents = 'none';

	el.textContent = `tab.id: ${tabId}`;

	document.body.appendChild(el);
}

function requestTabId(): void {
	chrome.runtime.sendMessage({type: 'GET_TAB_ID'}, (response) => {
		if (chrome.runtime.lastError) return;
		if (!response?.tabId) return;

		createOverlay(response.tabId);
	});
}

requestTabId();
