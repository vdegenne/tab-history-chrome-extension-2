import {OSMessengers} from '../offscreen.js'

OSMessengers.playTickSound.catch(() => {
	const audio = new Audio(chrome.runtime.getURL('./assets/audio/buzzing.mp3'))
	audio.volume = 0.2
	audio.play().catch((error) => console.error('Error playing sound:', error))
})
