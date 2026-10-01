import {readFile,writeFile,mkdir,access} from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import sharp from 'sharp'
import {intakeSchema} from './brand-images.mjs'

if(!process.argv.includes('--owner-confirmed-affiliate-use'))throw new Error('Explicit owner confirmation required; public images are not automatically licensed.')
const records=intakeSchema.parse(JSON.parse(await readFile('assets/brand-images.json','utf8')))
const brandHosts={
  'world-of-cosmetics':['worldofcosmetics.co.uk'], 'gift-for-she':['giftforshe.com','giftforshe2026.b-cdn.net'],
  'batterie-externe-shop':['batterie-externe-shop.fr'], 'be-ove':['ove-collection.com'], 'blue-oasis':['uk.blueoasisfilter.com'],
}
const shopifyStores={'cocon-de-lune':'/1/0967/9555/8270/','cosmic-garb':'/1/0963/0236/7084/','toybox':'/1/0030/6262/8465/','original-magic-art':'/1/1601/3103/','schenkdeinlied':'/1/0983/7776/1100/'}
function validSource(brandId,raw){
  const url=new URL(raw)
  if(url.protocol!=='https:'||url.username||url.password)return false
  if(shopifyStores[brandId])return url.hostname==='cdn.shopify.com'&&url.pathname.includes(shopifyStores[brandId])
  return brandHosts[brandId]?.includes(url.hostname.replace(/^www\./,''))||false
}
const root=path.resolve('assets/originals/brands'),ledger=[]
await mkdir(root,{recursive:true})
for(const record of records){
  if(!record.sourceImageUrl)continue // Supplied local files need no network.
  if(!record.permission.startsWith('Owner-confirmed affiliate image use, 2026-10-01;'))throw new Error(`Unconfirmed image use: ${record.id}`)
  if(!validSource(record.brandId,record.sourceImageUrl))throw new Error(`Non-official image source: ${record.id}`)
  const filename=path.resolve(root,record.originalFile)
  if(!filename.startsWith(root+path.sep))throw new Error(`Unsafe target: ${record.id}`)
  let bytes,downloaded=false
  try{await access(filename);bytes=await readFile(filename)}catch{
    const response=await fetch(record.sourceImageUrl,{signal:AbortSignal.timeout(25000)})
    if(!response.ok||!validSource(record.brandId,response.url))throw new Error(`Image fetch failed or redirected outside allowlist: ${record.id} (${response.status})`)
    if(!response.headers.get('content-type')?.startsWith('image/'))throw new Error(`Not an image response: ${record.id}`)
    if(Number(response.headers.get('content-length'))>16*1024*1024)throw new Error(`Image exceeds 16MB: ${record.id}`)
    const reader=response.body.getReader(),chunks=[];let size=0
    while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>16*1024*1024){await reader.cancel();throw new Error(`Image exceeds 16MB: ${record.id}`)}chunks.push(chunk.value)}
    bytes=Buffer.concat(chunks)
    const metadata=await sharp(bytes).metadata()
    if(!['jpeg','png','webp','avif','heif'].includes(metadata.format)||(metadata.pages||1)>1)throw new Error(`Unsupported product image: ${record.id}`)
    await mkdir(path.dirname(filename),{recursive:true})
    await writeFile(filename,bytes,{flag:'wx'}) // Never replace a supplied original.
    downloaded=true
  }
  const metadata=await sharp(bytes).metadata()
  ledger.push({id:record.id,brandId:record.brandId,sourceUrl:record.sourceUrl,sourceImageUrl:record.sourceImageUrl,originalFile:record.originalFile,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,width:metadata.width,height:metadata.height,permission:record.permission,checkedAt:new Date().toISOString()})
  console.log(`${downloaded?'Fetched':'Preserved'} ${record.id}: ${metadata.width}x${metadata.height}, ${bytes.length} bytes`)
}
await mkdir('docs/assets',{recursive:true})
await writeFile('docs/assets/brand-image-provenance.json',JSON.stringify(ledger,null,2)+'\n')
console.log(`Recorded ${ledger.length} official images; permission basis is owner confirmation, not independent merchant review.`)
