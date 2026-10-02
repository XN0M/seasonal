import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {readFileSync} from 'node:fs'
const manifest=JSON.parse(readFileSync((process.env.LANDING_QA_DIR||'dist')+'/.well-known/content-revision.json','utf8')) as {campaignSlugs:string[]}
const slug=manifest.campaignSlugs[0]
test('published campaign landing has real editorial value, safe click path and no automatic redirect',async({page,request})=>{
 test.skip(!slug,'No campaign is published in the source-only build')
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 for(const locale of ['en-gb','de-de','fr-fr']){
  await page.goto('/'+locale+'/promos/'+slug+'/')
  await expect(page.locator('h1')).not.toBeEmpty()
  await expect(page.locator('.landing-product')).not.toHaveCount(0)
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',/noindex/)
  await expect(page.locator('[data-affiliate]').first()).toHaveAttribute('href','/r/'+slug)
  const wrapped=await request.get('/r/'+slug+'?url=https://wrong.example',{maxRedirects:0})
  expect(wrapped.status()).toBe(302);expect(wrapped.headers().location).toBe('https://www.worldofcosmetics.co.uk/?ref=eghgrllo');expect(await wrapped.text()).toBe('')
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
  for(const width of [375,768,1024,1440]){
   await page.setViewportSize({width,height:900})
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   await page.screenshot({path:'docs/qa/admin-landing-'+locale+'-'+width+'.png',fullPage:true,scale:'css'})
  }
 }
 expect(errors).toEqual([])
})
test('admin, private assets and encoded namespace remain inaccessible on real local Worker',async({request,page})=>{
 const shell=await request.get('/_manage/',{maxRedirects:0})
 expect([303,403]).toContain(shell.status())
 if(shell.status()===303)expect(shell.headers()['location']).toBe('/_manage/login/')
 for(const path of ['/_manage/admin.js','/_manage/admin.css','/_manage/api/bootstrap','/%5fmanage/admin.js'])expect([401,403]).toContain((await request.get(path)).status())
 expect((await request.get('/_manage/_build/snapshot')).status()).toBe(403)
 await page.goto('/en-gb/')
 expect(await page.locator('a[href*="_manage"]').count()).toBe(0)
 const sitemap=await request.get('/sitemap-en-gb.xml');expect(await sitemap.text()).not.toContain('_manage')
})
