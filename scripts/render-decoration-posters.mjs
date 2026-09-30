import {chromium} from 'playwright'
import {readFile,writeFile} from 'node:fs/promises'
import {createRequire} from 'node:module'
import sharp from 'sharp'
const require=createRequire(import.meta.url)
const browser=await chromium.launch({headless:true})
try{
  const page=await browser.newPage()
  await page.setContent('<div id="art" style="width:240px;height:240px"></div>')
  await page.addScriptTag({path:require.resolve('lottie-web/build/player/lottie_light.js')})
  for(const event of ['christmas','black-friday'])for(const motif of event==='christmas'?['tree','gift','star']:['gift','star','bag']){
    const data=JSON.parse(await readFile(`public/animations/${event}/${motif}.json`,'utf8'))
    const svg=await page.evaluate(data=>new Promise(resolve=>{
      const container=document.querySelector('#art');container.innerHTML=''
      const animation=window.lottie.loadAnimation({container,renderer:'svg',autoplay:false,loop:false,animationData:data})
      animation.addEventListener('DOMLoaded',()=>{
        animation.goToAndStop((data.op-data.ip)*.55,true)
        const svg=container.querySelector('svg');svg.removeAttribute('style');svg.setAttribute('xmlns','http://www.w3.org/2000/svg')
        resolve(svg.outerHTML);animation.destroy()
      })
    }),data)
    await writeFile(`public/animations/${event}/${motif}.svg`,svg)
    if(motif==='tree'){
      await sharp(Buffer.from(svg)).resize(480,480,{fit:'contain'}).webp({quality:85}).toFile(`public/animations/${event}/${motif}.webp`)
      await sharp(Buffer.from(svg)).resize(320,320,{fit:'contain'}).webp({quality:80}).toFile(`public/animations/${event}/${motif}-320.webp`)
    }
    console.log('Poster',event,motif)
  }
}finally{await browser.close()}
