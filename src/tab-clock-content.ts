let startTime = Date.now();
let elapsedBeforeBlur = 0;
let isFocused = true;

const containerId = 'tab-focus-timer-widget';

function formatElapsed(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);

	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	}
	return `${seconds}s`;
}

function createWidget(): HTMLElement {
	const el = document.createElement('div');
	el.id = containerId;

	Object.assign(el.style, {
		position: 'fixed',
		// bottom: '2px',
		top: '2px',
		right: '100px',

		padding: '2px 6px',
		margin: '0',

		backgroundColor: 'rgba(50, 50, 50, 0.55)',
		color: 'rgba(255, 255, 255, 0.9)',

		fontSize: '11px',
		fontFamily: 'system-ui, sans-serif',
		lineHeight: '14px',

		borderRadius: '4px',
		zIndex: '999999',

		boxShadow: '0 -1px 6px rgba(0,0,0,0.25)',

		userSelect: 'none',
		pointerEvents: 'none',
	});

	el.textContent = '0s';
	document.body.appendChild(el);

	return el;
}

function updateWidget(el: HTMLElement): void {
	const now = Date.now();
	const elapsed = isFocused
		? elapsedBeforeBlur + (now - startTime)
		: elapsedBeforeBlur;

	el.textContent = formatElapsed(elapsed);
}

function startTicker(el: HTMLElement): void {
	setInterval(() => {
		updateWidget(el);
	}, 1000);
}

function handleFocus(): void {
	if (!isFocused) {
		isFocused = true;
		startTime = Date.now();
	}
}

function handleBlur(): void {
	if (isFocused) {
		isFocused = false;
		elapsedBeforeBlur += Date.now() - startTime;
	}
}

function init(): void {
	const widget = createWidget();

	window.addEventListener('focus', handleFocus);
	window.addEventListener('blur', handleBlur);

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') handleBlur();
		else handleFocus();
	});

	startTicker(widget);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
