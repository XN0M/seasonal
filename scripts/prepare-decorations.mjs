// Mechanical colour adaptation of downloaded, licensed Lottie source files.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
const motifs = ['tree', 'gift', 'star', 'bag']
const palettes = { christmas: ['#243e32', '#c6a46a', '#89384a'], 'black-friday': ['#20392e', '#c6a46a', '#20392e'] }
const rgb = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
function inspect(value) {
  if (!value || typeof value !== 'object') return
  if (typeof value.x === 'string' || value.ty === 5 || (typeof value.p === 'string')) throw Error('Unsupported expression/text/image asset')
  Object.values(value).forEach(inspect)
}
function recolour(value, palette) {
  if (!value || typeof value !== 'object') return
  if (['fl', 'st'].includes(value.ty) && value.c?.a === 0 && Array.isArray(value.c.k)) {
    const [r,g,b] = value.c.k
    const light = Math.max(r,g,b), dark = Math.min(r,g,b)
    const hex = light - dark < .08 ? (light > .8 ? '#faf8f3' : palette[0]) : g > r && g > b ? palette[0] : r > b && g > b && g > r*.55 ? palette[1] : palette[2]
    value.c.k = [...rgb(hex), ...(value.c.k.length > 3 ? [1] : [])]
  }
  Object.values(value).forEach(child => recolour(child, palette))
}
for (const motif of motifs) {
  const source = JSON.parse(await readFile(`docs/assets/source/${motif}.json`, 'utf8'))
  inspect(source)
  console.log(motif, 'layers', source.layers.length, 'assets', source.assets?.length ?? 0)
  for (const [event, palette] of Object.entries(palettes)) {
    if ((event==='christmas'&&motif==='bag')||(event==='black-friday'&&motif==='tree')) continue
    const data = structuredClone(source)
    recolour(data, palette)
    // Six-to-twelve second cycles, without changing the source keyframes.
    const duration = Math.min(12, Math.max(6, (data.op-data.ip)/data.fr))
    data.fr = (data.op-data.ip)/duration
    const json = JSON.stringify(data)
    const bytes = gzipSync(json).length
    if (bytes > 150 * 1024) throw Error(`${motif}: gzip budget exceeded`)
    await mkdir(`public/animations/${event}`, {recursive:true})
    await writeFile(`public/animations/${event}/${motif}.json`, json)
    console.log(event, motif, bytes, 'gzip bytes')
  }
}
