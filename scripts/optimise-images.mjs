import sharp from 'sharp'
import { mkdir,copyFile } from 'node:fs/promises'

await mkdir('public/images', { recursive: true })
for (const name of ['holiday-hero', 'gifts-for-her', 'family-gifts', 'black-friday']) {
  for (const width of [320, 640, 960, 1400]) {
    const input = `assets/originals/${name}.png`
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public/images/${name}-${width}.webp`)
    await sharp(input).resize({ width, withoutEnlargement: true }).avif({ quality: 48 }).toFile(`public/images/${name}-${width}.avif`)
  }
  await copyFile(`public/images/${name}-1400.webp`,`public/images/${name}.webp`)
}
