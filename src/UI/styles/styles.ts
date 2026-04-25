/* Applied to the document */
import './stylesheets/globals.css'
import './stylesheets/shared.css'
import './stylesheets/roboto.css'
import './material.js'

/* Applied to custom elements */
import {setBaseStyles} from 'lit-with-styles'
import shared from './stylesheets/shared.css?inline'
setBaseStyles(shared)
