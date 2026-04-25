/**
 * This script is living in the runtime ("background").
 * You can use the `offscreenManager` as a gateway between other runtime scripts
 * and the offscreen document.
 * Use `offscreenManager.guard` to register a function that will execute after
 * ensuring the offscreen document exists.
 * Typically you'll guard a method that will send a message to execute something
 * special in the offscreen (e.g. an option page needs to request a Firebase instance.)
 *
 * Call `offscreenManager.ensureDocument` manually if you want to create the document
 * prematurely, say from the background script when the extension is first installed.
 */
import {ActionMessenger} from '@vdegenne/chrome-extension/events/messaging.js'
import {OffScreenManager} from '@vdegenne/chrome-extension/OffScreenManager.js'

export const OSMessengers = {
	playTickSound: new ActionMessenger('play-tick-sound'),
	// isUserLoggedIn: new ActionMessenger<any, boolean>('is-user-logged-in'),
}

export const offscreenManager = new OffScreenManager({
	path: '/documents/offscreen/dist/index.html',
})

export const playTickSound = offscreenManager.guard(() =>
	OSMessengers.playTickSound.broadcast()
)
// export const logInUsingTokenId = offscreenManager.guard((tokenId: string) =>
// 	OSMessengers.login.broadcast({tokenId}),
// )

// ./UI/offscreen.ts
