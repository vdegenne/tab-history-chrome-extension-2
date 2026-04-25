import {css, html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import './styles/styles.js'
import './styles/themeStore.js'

@customElement('popup-shell')
@withStyles()
class PopupShell extends LitElement {
	static styles = css``

	render() {
		return html`<!-- -->
			Popup, but nothing yet.
			<!-- -->`
	}
}

const popupShell = new PopupShell()
document.body.appendChild(popupShell)
