export function copyToClipboard(text: string | number) {
	navigator.clipboard.writeText(text + '')
}

function deepEqual(a: any, b: any): boolean {
	if (a === b) return true

	if (
		typeof a !== 'object' ||
		a === null ||
		typeof b !== 'object' ||
		b === null
	)
		return false

	const keysA = Object.keys(a)
	const keysB = Object.keys(b)

	if (keysA.length !== keysB.length) return false

	for (const key of keysA) {
		if (!keysB.includes(key)) return false
		if (!deepEqual(a[key], b[key])) return false
	}

	return true
}

export function arraysDeepEqual(a: any[], b: any[]): boolean {
	if (a === b) return true
	if (a.length !== b.length) return false

	for (let i = 0; i < a.length; i++) {
		if (!deepEqual(a[i], b[i])) return false
	}
	return true
}
