import { test } from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import {prepareBrandImages,intakeSchema} from './brand-images.mjs'

const localized={'en-gb':'Synthetic QA image','de-de':'Synthetisches Testbild','fr-fr':'Image de test synthétique'}
const entry={id:'fixture',brandId:'fixture-brand',originalFile:'fixture.png',name:localized,description:localized,imageAlt:localized,sourceUrl:'https://example.com/fixture',permission:'Test fixture only; not a merchant product'}
test('empty intake is supported and invalid/duplicate/external inputs are rejected',async()=>{
  assert.deepEqual(await prepareBrandImages([],{originalsRoot:'absent',outputRoot:'absent'}),[])
  assert.equal(intakeSchema.safeParse([{...entry,originalFile:'../private.png'}]).success,false)
  assert.equal(intakeSchema.safeParse([{...entry,originalFile:'https://example.com/a.png'}]).success,false)
  assert.equal(intakeSchema.safeParse([{...entry,permission:''}]).success,false)
  assert.equal(intakeSchema.safeParse([entry,entry]).success,false)
})
test('all four supported formats preserve originals, actual dimensions and never upscale',async()=>{
  const taskRoot=await mkdtemp(path.join(os.tmpdir(),'seasonal-brand-images-'))
  try{
    const input=path.join(taskRoot,'originals'),output=path.join(taskRoot,'output')
    await mkdir(input)
    const entries=[]
    for(const format of ['png','jpg','webp','avif']){
      const bytes=await sharp({create:{width:40,height:60,channels:3,background:'#fffdf9'}}).toFormat(format==='jpg'?'jpeg':format).toBuffer()
      await writeFile(path.join(input,`fixture.${format}`),bytes)
      entries.push({...entry,id:`fixture-${format}`,originalFile:`fixture.${format}`})
    }
    const images=await prepareBrandImages(entries,{originalsRoot:input,outputRoot:output})
    assert.equal(images.length,4)
    for(const [index,image] of images.entries()){
      assert.equal(image.image.width,40);assert.equal(image.image.height,60)
      assert.equal(image.image.sources.length,1);assert.equal(image.image.sources[0].width,40)
      const format=['png','jpg','webp','avif'][index]
      assert.deepEqual(await readFile(path.join(input,`fixture.${format}`)),await readFile(path.join(output,`fixture-${format}-original.${format}`)))
      assert.equal((await sharp(path.join(output,`fixture-${format}-40.avif`)).metadata()).width,40)
    }
  }finally{
    // The path is created by mkdtemp and checked before recursive cleanup.
    if(path.dirname(taskRoot)!==path.resolve(os.tmpdir())||!path.basename(taskRoot).startsWith('seasonal-brand-images-'))throw new Error('Unsafe test cleanup path')
    await rm(taskRoot,{recursive:true,force:true,maxRetries:5,retryDelay:100})
  }
})
