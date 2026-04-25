import {css, html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import './styles/styles.js'
import './styles/themeStore.js'

@customElement('side-panel-shell')
@withStyles()
class SidePanelShell extends LitElement {
	static styles = css``

	render() {
		return html`<!-- -->
			<p>Thanks for using my extension ❤️</p>
			<!-- -->`
	}
}

const sidePanelShell = new SidePanelShell()
document.body.appendChild(sidePanelShell)
