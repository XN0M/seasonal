import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { prepareBrandImages } from './brand-images.mjs'

const input=JSON.parse(await readFile('assets/brand-images.json','utf8'))
const products=await prepareBrandImages(input,{originalsRoot:'assets/originals/brands',outputRoot:'public/images/brands'})
await mkdir('public/images/brands',{recursive:true})
await writeFile('public/images/brands/manifest.json',JSON.stringify(products,null,2)+'\n')
console.log(`Prepared ${products.length} source-recorded brand product images.`)
