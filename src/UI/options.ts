import {css, html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import './styles/styles.js'
import './styles/themeStore.js'

@customElement('options-shell')
@withStyles()
class OptionsShell extends LitElement {
	static styles = css``

	render() {
		return html`<!-- -->
			<p>Thanks for using my extension ❤️ No options yet though.</p>
			<!-- -->`
	}
}

const optionsShell = new OptionsShell()
document.body.appendChild(optionsShell)
