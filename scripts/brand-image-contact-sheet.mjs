import sharp from 'sharp'
import {readFile,writeFile} from 'node:fs/promises'
const photos=JSON.parse(await readFile('public/images/brands/manifest.json','utf8'))
const cols=4,width=280,height=310,rows=Math.ceil(photos.length/cols),composites=[]
for(const [index,photo]of photos.entries()){
  const left=index%cols*width,top=Math.floor(index/cols)*height
  const image=await sharp(`public${photo.image.src}`).resize(260,260,{fit:'contain',background:'#fffdf9'}).png().toBuffer()
  const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;')
  const caption=Buffer.from(`<svg width="280" height="38"><rect width="280" height="38" fill="#fffdf9"/><text x="10" y="17" font-size="11">${escape(photo.id)}</text><text x="10" y="32" font-size="10">${photo.image.width} × ${photo.image.height}</text></svg>`)
  composites.push({input:image,left:left+10,top:top+5},{input:caption,left,top:top+270})
}
await writeFile('docs/qa/brand-official-image-board.png',await sharp({create:{width:cols*width,height:rows*height,channels:3,background:'#fffdf9'}}).composite(composites).png().toBuffer())
