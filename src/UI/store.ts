import {ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
// import {saveToLocalStorage} from 'snar-save-to-local-storage';

// @saveToLocalStorage('tab-history-chrome-extension-2:store')
class Store extends ReactiveController {
	F = new FormBuilder(this)
}
export const store = new Store()
