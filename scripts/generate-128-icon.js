import sharp from 'sharp'
import pathlib from 'path'

const __dirname = import.meta.dirname

const imageToTransformFilepath = pathlib.join(
	__dirname,
	'../assets/img/pwa-512x512.png'
)
const outputFilepath = pathlib.join(
	__dirname,
	'../assets/img/chrome-store-128x128.png'
)

await sharp(imageToTransformFilepath).resize(128, 128).toFile(outputFilepath)

console.log('✅ Image resized and saved to', outputFilepath)
