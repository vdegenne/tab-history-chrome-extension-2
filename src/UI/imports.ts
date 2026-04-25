export async function getThemeStore() {
	const {themeStore} = await import('./styles/themeStore.js')
	return themeStore
}

export async function getSettingsDialog() {
	const {settingsDialog} = await import('./settings/settings-dialog.js')
	return settingsDialog
}

export async function openSettingsDialog() {
	const dialog = await getSettingsDialog()
	dialog.show()
}
