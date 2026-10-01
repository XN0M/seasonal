import sharp from 'sharp'
import { z } from 'zod'
import { mkdir, realpath, copyFile } from 'node:fs/promises'
import path from 'node:path'

// Release libvips file handles between builds on Windows.
sharp.cache(false)

const localized = z.object({'en-gb':z.string().min(1),'de-de':z.string().min(1),'fr-fr':z.string().min(1)})
const httpsUrl = z.url().refine(value=>{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password},'HTTPS source without credentials required')
export const intakeSchema = z.array(z.object({
  id:z.string().regex(/^[a-z0-9-]+$/),brandId:z.string().regex(/^[a-z0-9-]+$/),
  originalFile:z.string().regex(/^[a-z0-9/-]+\.(png|jpg|jpeg|webp|avif)$/i),
  name:localized,description:localized,imageAlt:localized,sourceUrl:httpsUrl,sourceImageUrl:httpsUrl.optional(),permission:z.string().min(1),
})).superRefine((entries,ctx)=>{if(new Set(entries.map(entry=>entry.id)).size!==entries.length)ctx.addIssue({code:'custom',message:'Duplicate image/product IDs'})})

/** Derivatives are build outputs; supplied originals are preserved unchanged. */
export async function prepareBrandImages(input, {originalsRoot,outputRoot,publicPrefix='/images/brands'}) {
  const entries=intakeSchema.parse(input)
  if(!entries.length)return []
  const inputRoot=await realpath(path.resolve(originalsRoot))
  const output=path.resolve(outputRoot)
  await mkdir(output,{recursive:true})
  const result=[]
  for(const entry of entries){
    const filename=await realpath(path.resolve(inputRoot,entry.originalFile))
    if(!filename.startsWith(inputRoot+path.sep))throw new Error(`Original outside intake directory: ${entry.originalFile}`)
    const metadata=await sharp(filename).metadata()
    if((metadata.pages||1)>1)throw new Error(`Animated product image is not supported: ${entry.id}`)
    const originalWidth=metadata.autoOrient?.width||metadata.width
    if(!originalWidth)throw new Error(`Missing dimensions: ${entry.id}`)
    const sizes=[...new Set([320,640,960,1400].map(width=>Math.min(width,originalWidth)))]
    const sources=[]
    let dimensions
    for(const width of sizes){
      const stem=`${entry.id}-${width}`
      const webp=path.join(output,`${stem}.webp`),avif=path.join(output,`${stem}.avif`)
      await sharp(filename).rotate().resize({width,withoutEnlargement:true}).webp({quality:82}).toFile(webp)
      await sharp(filename).rotate().resize({width,withoutEnlargement:true}).avif({quality:50}).toFile(avif)
      dimensions=await sharp(webp).metadata()
      sources.push({width:dimensions.width,webp:`${publicPrefix}/${stem}.webp`,avif:`${publicPrefix}/${stem}.avif`})
    }
    await copyFile(filename,path.join(output,`${entry.id}-original${path.extname(filename).toLowerCase()}`))
    const {originalFile,...fields}=entry
    result.push({...fields,image:{src:sources.at(-1).webp,width:dimensions.width,height:dimensions.height,sources}})
  }
  return result
}
