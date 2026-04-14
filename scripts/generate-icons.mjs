/**
 * Generates PWA icon PNGs from favicon.svg using sharp.
 * Run once before deploy: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgBuffer = readFileSync(resolve(root, 'public/favicon.svg'))

const icons = [
  { out: 'public/pwa-192x192.png',       size: 192 },
  { out: 'public/pwa-512x512.png',       size: 512 },
  { out: 'public/apple-touch-icon.png',  size: 180 },
]

for (const { out, size } of icons) {
  await sharp(svgBuffer, { density: Math.round((size / 48) * 72) })
    .resize(size, size, { fit: 'contain', background: { r: 248, g: 250, b: 252, alpha: 1 } })
    .png()
    .toFile(resolve(root, out))
  console.log(`✓ ${out} (${size}x${size})`)
}

console.log('\nAll icons generated. Commit the files in public/ before deploying.')
