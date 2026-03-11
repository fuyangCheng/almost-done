import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = resolve(__dir, '..')

// Generate app icons from the square puzzle icon (cropped from logo)
// The puzzle block spans x:50-350, y:25-325 → 300×300 in a 400×440 viewBox
// We re-render just the icon portion using a modified SVG
const logoSvg = readFileSync(resolve(root, 'public/logo.svg'), 'utf8')

// Modify viewBox to zoom into just the puzzle block, add rounded bg
const iconSvg = logoSvg
  .replace('viewBox="0 0 400 440"', 'viewBox="44 19 312 312"')

const iconBuf = Buffer.from(iconSvg)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  await sharp(iconBuf)
    .resize(size, size)
    .png()
    .toFile(resolve(root, `public/icons/icon-${size}x${size}.png`))
  console.log(`✓ icon-${size}x${size}.png`)
}

await sharp(iconBuf).resize(180, 180).png().toFile(resolve(root, 'public/apple-touch-icon.png'))
console.log('✓ apple-touch-icon.png')

await sharp(iconBuf).resize(32, 32).png().toFile(resolve(root, 'public/favicon.png'))
console.log('✓ favicon.png')

console.log('\nDone! Icons generated from new metallic logo.')
