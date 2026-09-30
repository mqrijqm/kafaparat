// media-src/*.png -> public/media/*.webp (max 1600px), og-image -> 1200x630 jpg.
// Optional: --sheet <file.jpg> writes a contact sheet for quick review.
import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import { join, basename } from 'node:path'

const RAW = 'media-src'
const OUT = 'public/media'
const files = readdirSync(RAW).filter((f) => f.endsWith('.png'))

for (const f of files) {
  const name = basename(f, '.png')
  const src = sharp(join(RAW, f))
  if (name === 'og-image') {
    await src.clone().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(OUT, 'og-image.jpg'))
  }
  const max = name.startsWith('swatch') || name === 'hallmark' ? 400 : 1600
  const info = await src
    .resize(max, max, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(OUT, `${name}.webp`))
  console.log(`${name}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
}

const sheetIdx = process.argv.indexOf('--sheet')
if (sheetIdx > 0) {
  const cell = 300
  const cols = 6
  const rows = Math.ceil(files.length / cols)
  const tiles = await Promise.all(
    files.map(async (f, i) => ({
      input: await sharp(join(RAW, f)).resize(cell, cell, { fit: 'cover' }).toBuffer(),
      left: (i % cols) * cell,
      top: Math.floor(i / cols) * cell,
    })),
  )
  await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: '#111' } })
    .composite(tiles)
    .jpeg({ quality: 80 })
    .toFile(process.argv[sheetIdx + 1])
  console.log('sheet:', files.map((f, i) => `${i + 1}.${basename(f, '.png')}`).join('  '))
}
