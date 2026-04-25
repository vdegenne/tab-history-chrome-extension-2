import {cssModules} from '@vdegenne/vite-plugin-css-modules'
import {materialAll} from 'rollup-plugin-material-all'
import {defineConfig} from 'vite'
import {mdicon2svg} from 'vite-plugin-mdicon2svg'

const DEV = !!process.env.NODE_ENV?.toLowerCase().startsWith('dev')

export default defineConfig({
	base: './',
	esbuild: {
		legalComments: 'none',
	},
	build: {minify: !DEV},
	plugins: [
		materialAll({
			//includeComments: true
			// include: ['./documents/**/*.js'],
		}),
		mdicon2svg({
			include: [
				'./src/UI/**/*.ts',
				'./node_modules/@vdegenne/material-color-helpers/lib/elements/**/*.js',
			],
		}),
		// materialShell(),
		// minifyTemplateLiterals(),
		// minifyHtml(),
		cssModules(),
	],
})
