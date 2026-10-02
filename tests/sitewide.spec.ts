import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('brand finder migrates old URLs and restores selections with browser history',async({page})=>{
  await page.goto('/en-gb/gift-finder/?recipient=teens&category=accessories&budget=50-100&market=FR&utm_source=paid#main-content')
  await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
  await expect(page).not.toHaveURL(/budget=/)
  await expect(page).toHaveURL(/category=fashion/)
  await expect(page).toHaveURL(/utm_source=paid/)
  await expect(page).toHaveURL(/#main-content$/)
  await expect(page.locator('.finder-migration')).toBeVisible()
  await expect(page.locator('[data-brand-finder] astro-island')).toHaveCount(0)
  await expect(page.locator('.finder-brand-list [data-brand-id]')).toHaveCount(1)
  await page.getByRole('button',{name:'Creative gifts',exact:true}).click()
  await expect(page).toHaveURL(/category=creative/)
  await expect(page.locator('.finder-brand-list [data-brand-id]')).toHaveAttribute('data-brand-id','toybox')
  await page.goBack();await expect(page.getByRole('button',{name:'Fashion',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.goForward();await expect(page.getByRole('button',{name:'Creative gifts',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.getByLabel('03 · Occasion').selectOption('halloween-2026')
  await expect(page.locator('.finder__empty')).toBeVisible()
  await expect(page).toHaveURL(/recipient=teens/)
  await expect(page).toHaveURL(/category=creative/)
  await page.getByRole('button',{name:'Remove: Occasion',exact:true}).click()
  await expect(page.locator('.finder-brand-list [data-brand-id]')).toHaveCount(1)
})

test('Finder SSR has all ten native affiliate links with JavaScript disabled and storage failure is safe',async({browser,page})=>{
  const context=await browser.newContext({javaScriptEnabled:false}),fallback=await context.newPage()
  await fallback.goto('http://127.0.0.1:5181/fr-fr/gift-finder/?recipient=children&event=halloween-2026')
  await expect(fallback.locator('.finder-brand-list [data-brand-id]')).toHaveCount(10)
  await expect(fallback.locator('.finder-brand-list a[rel~="sponsored"]')).toHaveCount(10)
  // Playwright's aggregate text helper deliberately skips NOSCRIPT nodes.
  // Inspect the visible paragraph to prove the fallback is actually rendered.
  await expect(fallback.locator('noscript p')).toBeVisible()
  await expect(fallback.locator('noscript p')).toContainText('JavaScript')
  await fallback.route('https://www.worldofcosmetics.co.uk/**',route=>route.fulfill({body:'Retailer fixture'}))
  await fallback.locator('[data-brand-id="world-of-cosmetics"] a[rel~="sponsored"]').click()
  await expect(fallback).toHaveURL('https://www.worldofcosmetics.co.uk/?ref=eghgrllo')
  await context.close()
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage denied')}})})
  await page.goto('/de-de/gift-finder/')
  await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
  await expect(page.locator('.finder-brand-list [data-brand-id]')).toHaveCount(10)
})

test('Finder external click emits once; internal Explore never emits',async({page})=>{
  await page.addInitScript(()=>window.addEventListener('affiliate_click',()=>sessionStorage.setItem('finder-clicks',String(Number(sessionStorage.getItem('finder-clicks')||'0')+1))))
  await page.goto('/en-gb/gift-finder/?market=DE')
  await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
  const payload=JSON.parse((await page.locator('[data-brand-id="world-of-cosmetics"] [data-affiliate]').getAttribute('data-affiliate'))!)
  expect(payload.market).toBe('DE');expect(payload.eventId).toBe('halloween-2026')
  await page.evaluate(()=>sessionStorage.setItem('finder-clicks','0'))
  await page.locator('[data-brand-id="world-of-cosmetics"] a:not([rel])').click()
  expect(await page.evaluate(()=>sessionStorage.getItem('finder-clicks'))).toBe('0')
  await page.goBack()
  await page.route('https://www.worldofcosmetics.co.uk/**',route=>route.fulfill({body:'Retailer fixture'}))
  await page.locator('[data-brand-id="world-of-cosmetics"] a[rel~="sponsored"]').click()
  await expect(page).toHaveURL('https://www.worldofcosmetics.co.uk/?ref=eghgrllo')
  await page.goBack()
  expect(await page.evaluate(()=>sessionStorage.getItem('finder-clicks'))).toBe('1')
})

test('localized shopping surfaces and guides have genuine brand paths and no concept listings',async({page},info)=>{
  test.setTimeout(180000)
  const errors:string[]=[],remote:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())})
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:5181/'))remote.push(request.url())})
  for(const locale of ['en-gb','de-de','fr-fr']){
    for(const route of ['gifts/women/','gifts/children/','gift-finder/','guides/age-appropriate-gifts/','guides/calm-black-friday/','guides/holiday-shopping-timing/','policies/affiliate/']){
      await page.goto(`/${locale}/${route}`)
      if(route==='gift-finder/')await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
      await expect(page.locator('.product-card,.finder-concepts')).toHaveCount(0)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)
      if(route.startsWith('guides/')){
        await expect(page.locator('.article-body')).toHaveAttribute('lang',locale==='en-gb'?'en-GB':locale==='de-de'?'de-DE':'fr-FR')
        await expect(page.locator('.guide-sources a')).not.toHaveCount(0)
        await expect(page.locator('[data-affiliate]')).not.toHaveCount(0)
        if(route.includes('age-appropriate'))await expect(page.locator('[data-featured-product]')).toHaveCount(2)
        const panel=await page.locator('.guide-reading').evaluate(node=>getComputedStyle(node,'::before').backgroundColor)
        expect(panel).toBe('rgb(255, 253, 249)')
      }
      expect((await new AxeBuilder({page}).analyze()).violations,`${locale}/${route}`).toEqual([])
    }
  }
  for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:900})
    for(const route of ['gift-finder/','guides/age-appropriate-gifts/','gifts/women/','campaigns/black-friday/']){
      await page.goto('/en-gb/'+route)
      if(route==='gift-finder/')await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`${route} ${width}`).toBeLessThanOrEqual(1)
      if(info.project.name==='desktop'){
        for(const image of await page.locator('.brand-media img,.finder-brand-list img').all()){
          await image.scrollIntoViewIfNeeded()
          await expect(image).toHaveJSProperty('complete',true)
          expect(await image.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
          expect(await image.evaluate(node=>getComputedStyle(node).objectFit)).toBe('contain')
        }
        await page.evaluate(()=>window.scrollTo(0,0))
        await page.screenshot({path:`docs/qa/sitewide-${route.split('/')[0]}-${width}.png`,fullPage:true,scale:'css'})
      }
    }
  }
  expect(errors).toEqual([]);expect(remote).toEqual([])
})
