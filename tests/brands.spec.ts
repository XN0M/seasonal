import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('two separate brand destinations preserve exact affiliate URL and emit one brand click',async({page})=>{
  await page.goto('/en-gb/brands/')
  const card=page.locator('[data-brand-id="world-of-cosmetics"]')
  await expect(card.getByRole('link',{name:'Visit brand: World of Cosmetics'})).toHaveAttribute('href','/r/brand-world-of-cosmetics')
  await expect(card.getByRole('link',{name:'Explore brand: World of Cosmetics'})).toHaveAttribute('href','/en-gb/brands/world-of-cosmetics/')
  await page.evaluate(()=>{sessionStorage.setItem('brand-click-count','0');window.addEventListener('affiliate_click',event=>{sessionStorage.setItem('brand-click',JSON.stringify((event as CustomEvent).detail));sessionStorage.setItem('brand-click-count',String(Number(sessionStorage.getItem('brand-click-count'))+1))})})
  await card.getByRole('link',{name:'Explore brand: World of Cosmetics'}).click()
  await expect(page.locator('h1')).toHaveText('World of Cosmetics')
  expect(await page.evaluate(()=>sessionStorage.getItem('brand-click-count'))).toBe('0')
  await expect(page.locator('[data-featured-product]')).toHaveCount(3)
  await page.evaluate(()=>window.addEventListener('affiliate_click',event=>{sessionStorage.setItem('brand-click',JSON.stringify((event as CustomEvent).detail));sessionStorage.setItem('brand-click-count',String(Number(sessionStorage.getItem('brand-click-count'))+1))}))
  await page.route('https://www.worldofcosmetics.co.uk/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Retailer fixture</h1>'}))
  await page.getByRole('link',{name:'Visit brand: World of Cosmetics',exact:true}).click()
  await expect(page).toHaveURL('https://www.worldofcosmetics.co.uk/?ref=eghgrllo')
  await page.goBack()
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('brand-click')||'{}'))).toMatchObject({targetType:'brand',brandId:'world-of-cosmetics',trackingId:'eghgrllo',placement:'brand-profile',market:'GB'})
  expect(await page.evaluate(()=>sessionStorage.getItem('brand-click-count'))).toBe('1')
})

test('directory filter is shareable and back/forward restores category without losing campaign parameters',async({page})=>{
  await page.goto('/en-gb/brands/?category=beauty&utm_source=fixture')
  await expect(page.locator('[data-brand-filter]')).toBeVisible()
  await expect(page.locator('[data-brand-category]:visible')).toHaveCount(1)
  await page.getByLabel('Filter by interest').selectOption('fashion')
  await expect(page).toHaveURL(/category=fashion/)
  await expect(page).toHaveURL(/utm_source=fixture/)
  await expect(page.locator('[data-brand-category]:visible')).toHaveCount(2)
  await page.goBack()
  await expect(page.getByLabel('Filter by interest')).toHaveValue('beauty')
  await page.goForward()
  await expect(page.getByLabel('Filter by interest')).toHaveValue('fashion')
  await page.getByLabel('Filter by interest').selectOption('all')
  await expect(page.locator('[data-brand-category]:visible')).toHaveCount(10)
  await expect(page).not.toHaveURL(/category=/)
})

test('all locales open approved links with delivery restrictions and retain accessible introductions and seasonal regression',async({page})=>{
  const errors:string[]=[],remote:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())})
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:5181/'))remote.push(request.url())})
  for(const [locale,available] of [['en-gb',10],['de-de',10],['fr-fr',10]] as const){
    await page.goto(`/${locale}/brands/`)
    await expect(page.locator('[data-brand-id]')).toHaveCount(10)
    await expect(page.locator('.brand-card__actions a[data-affiliate]')).toHaveCount(available)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
    await page.goto(`/${locale}/brands/world-of-cosmetics/`)
    const own=page.locator('.brand-profile__intro a[data-affiliate]')
    await expect(own).toHaveCount(1)
    if(locale!=='en-gb')await expect(page.locator('.brand-profile__intro [data-fulfilment="restricted"]')).toBeVisible()
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
    await expect(page.locator('[data-decoration][data-static="true"]')).toHaveCount(2)
  }
  await page.goto('/en-gb/events/black-friday/')
  await expect(page.locator('#event-picks [data-brand-id]')).toHaveCount(3)
  await expect(page.locator('#event-picks [data-brand-id]').first()).toHaveAttribute('data-brand-id','toybox')
  await page.goto('/en-gb/events/holiday-gift-season/')
  await expect(page.locator('[data-santa]')).toHaveCount(1)
  await expect(page.locator('#event-picks [data-brand-id]').first()).toHaveAttribute('data-brand-id','toybox')
  expect(errors).toEqual([]);expect(remote).toEqual([])
})

test('directory and profiles fit four viewports and preserve touch targets',async({page},info)=>{
  test.setTimeout(120000)
  for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:900})
    for(const path of ['/en-gb/brands/','/en-gb/brands/world-of-cosmetics/','/fr-fr/brands/cocon-de-lune/']){
      await page.goto(path)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`${path} at ${width}px`).toBeLessThanOrEqual(1)
      for(const button of await page.locator('.brand-card .button,.brand-profile__intro .button').all())expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(48)
      if(info.project.name==='desktop')await page.screenshot({path:`docs/qa/brands-${path.includes('cocon')?'fr-profile':path.includes('world-of')?'profile':'directory'}-${width}.png`,fullPage:true,scale:'css'})
    }
  }
})

test('native brand navigation and eligible shopping links work without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false})
  const page=await context.newPage()
  await page.goto('http://127.0.0.1:5181/en-gb/brands/')
  await expect(page.locator('[data-brand-id]')).toHaveCount(10)
  await expect(page.locator('[data-brand-filter-controls]')).toBeHidden()
  await page.getByRole('link',{name:'Explore brand: World of Cosmetics',exact:true}).click()
  await page.route('https://www.worldofcosmetics.co.uk/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Retailer fixture</h1>'}))
  await page.getByRole('link',{name:'Visit brand: World of Cosmetics',exact:true}).click()
  await expect(page).toHaveURL('https://www.worldofcosmetics.co.uk/?ref=eghgrllo')
  await context.close()
})

test('official gallery image, title and CTA all use the exact brand-home URL once per click',async({page})=>{
  const href='https://www.worldofcosmetics.co.uk/?ref=eghgrllo'
  await page.route('https://www.worldofcosmetics.co.uk/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Retailer fixture</h1>'}))
  for(const placement of ['featured-product-image','featured-product-title','featured-product-cta']){
    await page.goto('/en-gb/brands/world-of-cosmetics/')
    const product=page.locator('[data-featured-product]').first()
    const link=product.locator('a[data-affiliate]')
    for(const anchor of await link.all()){await expect(anchor).toHaveAttribute('href','/r/brand-world-of-cosmetics');await expect(anchor).toHaveAttribute('data-original-affiliate',href)}
    await page.evaluate(()=>{sessionStorage.setItem('photo-click-count','0');window.addEventListener('affiliate_click',event=>{sessionStorage.setItem('photo-click-count',String(Number(sessionStorage.getItem('photo-click-count'))+1));sessionStorage.setItem('photo-click',JSON.stringify((event as CustomEvent).detail))})})
    const anchor=product.locator('a[data-affiliate]').nth(['featured-product-image','featured-product-title','featured-product-cta'].indexOf(placement))
    await anchor.click()
    await expect(page).toHaveURL(href)
    await page.goBack()
    expect(await page.evaluate(()=>sessionStorage.getItem('photo-click-count'))).toBe('1')
    expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('photo-click')||'{}'))).toMatchObject({targetType:'brand',featuredProductId:'woc-mua-jewelled-palette',placement})
  }
})

test('homepage category slots and real photo galleries fit four widths without remote imagery',async({page},info)=>{
  test.setTimeout(120000)
  const remote:string[]=[]
  page.on('request',request=>{if(request.resourceType()==='image'&&!request.url().startsWith('http://127.0.0.1:5181/'))remote.push(request.url())})
  for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:900})
    for(const [path,count]of [['/en-gb/',6],['/de-de/brands/schenkdeinlied/',1],['/fr-fr/brands/cocon-de-lune/',2],['/en-gb/brands/world-of-cosmetics/',3]] as const){
      await page.goto(path)
      await expect(page.locator(path==='/en-gb/'?'[data-brand-lead]':'[data-featured-product]')).toHaveCount(count)
      await page.locator('.site-footer').scrollIntoViewIfNeeded()
      for(const image of await page.locator('.brand-media img').all()){
        await image.scrollIntoViewIfNeeded()
        await expect(image).toHaveJSProperty('complete',true)
        expect(await image.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
        expect(await image.evaluate(node=>getComputedStyle(node).objectFit)).toBe('contain')
        expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0)
        expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0)
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
      if(width===375)expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
      if(info.project.name==='desktop'){
        await page.evaluate(()=>window.scrollTo(0,0))
        await page.screenshot({path:`docs/qa/official-photos-${path==='/en-gb/'?'home':path.includes('schenk')?'one':path.includes('cocon')?'two':'three'}-${width}.png`,fullPage:true,scale:'css'})
      }
    }
  }
  // Six-card layout fixture reuses verified photos; it is never site catalog data.
  await page.goto('/en-gb/brands/world-of-cosmetics/')
  await page.evaluate(()=>{const grid=document.querySelector('.brand-profile__gallery .brand-grid')!;[...grid.children].forEach(card=>grid.append(card.cloneNode(true)))})
  await expect(page.locator('[data-featured-product]')).toHaveCount(6)
  for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:900})
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),`six-image fixture at ${width}px`).toBeLessThanOrEqual(1)
  }
  expect(remote).toEqual([])
})
