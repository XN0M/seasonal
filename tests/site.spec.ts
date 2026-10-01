import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('homepage is responsive, accessible and contains no active commercial CTA', async ({ page }) => {
  await page.goto('/en-gb/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A little Halloween magic')
  await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0)
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('gift finder reflects filters in the URL', async ({ page }) => {
  await page.goto('/en-gb/gift-finder/')
  await page.getByRole('button', { name: 'Women' }).click()
  await expect(page).toHaveURL(/recipient=women/)
  await page.getByRole('button', { name: 'Beauty', exact: true }).click()
  await expect(page).toHaveURL(/category=beauty/)
})

test('layouts do not overflow target viewports', async ({ page }, testInfo) => {
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/en-gb/')
    await page.evaluate(() => localStorage.setItem('seasonal-edit-consent', 'essential'))
    await page.reload()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1)
    await page.screenshot({ path: testInfo.outputPath(`homepage-${width}.png`), fullPage: true })
    await page.screenshot({ path: testInfo.outputPath(`first-screen-${width}.png`) })
  }
})

test('localized event switching, menu keyboard and all five finder criteria work',async({page})=>{
  await page.goto('/en-gb/events/holiday-gift-season/')
  await page.getByRole('combobox',{name:'Market and language'}).selectOption({label:'DE · DE'})
  await expect(page).toHaveURL(/de-de\/events\/weihnachtsgeschenke/)
  await page.setViewportSize({width:375,height:812})
  await page.getByRole('button',{name:'Open menu'}).click()
  await expect(page.getByRole('dialog',{name:'Navigation menu'})).toBeVisible()
  await expect(page.locator('[data-menu-open]')).toHaveAttribute('aria-expanded','true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button',{name:'Open menu'})).toBeFocused()
  await page.goto('/en-gb/gift-finder/?budget=25-50&event=black-friday-2026&market=FR&utm_source=test')
  await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
  await expect(page.getByLabel('05 · Retail market')).toHaveValue('FR')
  await expect(page.getByLabel('04 · Event')).toHaveValue('black-friday-2026')
  await page.getByRole('button',{name:'Women',exact:true}).click()
  await expect(page).toHaveURL(/utm_source=test/)
  await expect(page).toHaveURL(/recipient=women/)
  await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0)
})

test('page has no browser/asset errors and no unconfigured tracker',async({page})=>{
  const errors:string[]=[]
  const remote:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())})
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`)})
  page.on('request',request=>{if(/googletagmanager|google-analytics|facebook/.test(request.url()))remote.push(request.url())})
  for(const path of ['/en-gb/','/de-de/','/fr-fr/','/en-gb/gift-finder/','/en-gb/guides/calm-black-friday/','/en-gb/policies/privacy/']){
    await page.goto(path)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)
  }
  expect(errors).toEqual([])
  expect(remote).toEqual([])
})

test('affiliate handler forwards exact payload in the same tab and blocks expired links',async({page})=>{
  await page.goto('/en-gb/')
  const detail={productId:'p1',brandId:'b1',merchantId:'m1',market:'GB',locale:'en-gb',eventId:'holiday-2026',placement:'test-fixture',trackingId:'exact-123'}
  await page.evaluate(payload=>{
    const link=document.createElement('a');link.textContent='Test expired fixture';link.href='https://merchant.example/expired';link.rel='sponsored nofollow';link.dataset.affiliate=JSON.stringify(payload);link.dataset.expiresAt='2020-01-01T00:00:00Z';document.querySelector('main')!.prepend(link)
  },detail)
  await page.getByRole('link',{name:'Test expired fixture'}).click()
  await expect(page).toHaveURL(/\/en-gb\/$/)
  await page.evaluate(payload=>{
    window.addEventListener('affiliate_click',event=>sessionStorage.setItem('test-click',JSON.stringify((event as CustomEvent).detail)))
    const link=document.createElement('a');link.textContent='Test active fixture';link.href='https://merchant.example/item?tracking=exact-123';link.rel='sponsored nofollow';link.dataset.affiliate=JSON.stringify(payload);link.dataset.expiresAt='2099-01-01T00:00:00Z';document.querySelector('main')!.prepend(link)
  },detail)
  await page.route('https://merchant.example/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Retailer fixture</h1>'}))
  await page.getByRole('link',{name:'Test active fixture'}).click()
  await expect(page).toHaveURL('https://merchant.example/item?tracking=exact-123')
  await page.goBack()
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('test-click')||'{}'))).toEqual(detail)
})

test('all locale event pages and finder pass accessibility checks',async({page})=>{
  for(const path of ['/de-de/','/fr-fr/','/en-gb/events/black-friday/','/en-gb/gift-finder/','/design-system/']){
    await page.goto(path)
    if(path.includes('gift-finder'))await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
    const result=await new AxeBuilder({page}).analyze()
    expect(result.violations,`axe violations at ${path}`).toEqual([])
  }
})

test('FAQ, anchor navigation, reduced motion and touch controls work',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/en-gb/')
  await page.getByRole('link',{name:'Explore the event',exact:true}).first().click()
  await page.getByRole('link',{name:'Gifts',exact:true}).last().click()
  await expect(page).toHaveURL(/#event-picks$/)
  const faq=page.locator('.faq details').first()
  await faq.locator('summary').click()
  await expect(faq).toHaveAttribute('open','')
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  await page.goto('/en-gb/gift-finder/')
  await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
  for(const element of await page.locator('.finder button,.finder select,.locale-switcher select').all()){
    const box=await element.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(48)
  }
})

test('privacy choice can be changed without activating an unconfigured SDK',async({page})=>{
  const remote:string[]=[]
  page.on('request',request=>{if(/googletagmanager|google-analytics|facebook/.test(request.url()))remote.push(request.url())})
  await page.goto('/en-gb/')
  await page.getByRole('button',{name:'Privacy preferences'}).click()
  await page.getByRole('button',{name:'Allow measurement'}).click()
  expect(await page.evaluate(()=>localStorage.getItem('seasonal-edit-consent'))).toBe('accepted')
  await page.getByRole('button',{name:'Privacy preferences'}).click()
  await page.getByRole('button',{name:'Essential only'}).click()
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('seasonal-edit-consent'))).toBe('essential')
  expect(remote).toEqual([])
})
