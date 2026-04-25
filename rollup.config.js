import {config, json, nodeResolve, terser} from '@vdegenne/rollup'

const plugins = [
	//typescript(),
	nodeResolve(),
	json(),
	terser(),
]

export default config([
	{
		input: './lib/content.js',
		output: {file: './content.js', format: 'iife'},
		plugins,
	},
	{
		input: './lib/background.js',
		output: {file: './background.js', format: 'iife'},
		plugins,
	},
	// {
	// 	input: './lib/offscreen/script.js',
	// 	output: {file: './documents/offscreen/offscreen.js', format: 'iife'},
	// 	plugins,
	// },
])
