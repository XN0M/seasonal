import {test,expect,type Page} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function toggle(page:Page){
  let button=page.locator('[data-effects-toggle]:visible').first()
  if(!await button.count()){await page.getByRole('button',{name:'Open menu',exact:true}).click();button=page.locator('[data-effects-toggle]:visible').first()}
  await button.focus();await page.keyboard.press('Space')
  if(await page.getByRole('dialog').isVisible())await page.keyboard.press('Escape')
}
test('six home placements, four event placements, static editorial pages and localized accessible controls',async({page})=>{
  for(const path of ['/en-gb/','/de-de/','/fr-fr/']){
    await page.goto(path)
    await expect(page.locator('[data-decoration]')).toHaveCount(6)
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/)
  }
  for(const path of ['/en-gb/events/holiday-gift-season/','/en-gb/events/black-friday/','/de-de/events/black-friday/','/fr-fr/events/black-friday/']){
    await page.goto(path)
    await expect(page.locator('[data-decoration]')).toHaveCount(4)
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
  }
  await page.goto('/en-gb/gift-finder/')
  await expect(page.locator('[data-decoration]')).toHaveCount(2)
  await page.getByRole('button',{name:'Women',exact:true}).click()
  await expect(page).toHaveURL(/recipient=women/)
  await page.goto('/en-gb/guides/calm-black-friday/')
  await expect(page.locator('[data-decoration][data-static="true"]')).toHaveCount(2)
})
test('reduced motion is static by default, keyboard opt-in works, saved old on does not override',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('seasonal-edit-effects','on'))
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/en-gb/')
  await expect(page.locator('html')).toHaveAttribute('data-effects','off')
  await expect(page.locator('[data-effects-enable]')).toBeVisible()
  await toggle(page)
  await expect(page.locator('html')).toHaveAttribute('data-effects','on')
  await expect(page.locator('html')).toHaveAttribute('data-effects-preference','on')
  await expect(page.locator('[data-seasonal-scene]')).toHaveAttribute('data-santa-state','done',{timeout:10000})
  await page.locator('[data-santa-replay]').click()
  await expect(page.locator('[data-seasonal-scene]')).toHaveAttribute('data-santa-state','playing')
  expect(await page.locator('[data-santa]').evaluate(node=>getComputedStyle(node).animationDuration)).toBe('3s')
  await expect(page.locator('[data-seasonal-scene]')).toHaveAttribute('data-santa-state','done',{timeout:10000})
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-effects','on')
  await expect(page.locator('[data-seasonal-scene]')).toHaveAttribute('data-santa-state','idle')
  await toggle(page)
  await expect(page.locator('html')).toHaveAttribute('data-effects','off')
  await page.locator('[data-effects-enable]').click()
  await expect(page.locator('[data-santa-replay]')).toBeVisible()
})
test('legacy off migrates, effects persist between events and disabled commerce is unchanged',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('seasonal-edit-effects','off'))
  await page.goto('/en-gb/')
  await expect(page.locator('html')).toHaveAttribute('data-effects','off')
  await toggle(page)
  await page.goto('/en-gb/events/black-friday/')
  await expect(page.locator('html')).toHaveAttribute('data-effects','on')
  await expect(page.locator('[data-santa]')).toHaveCount(0)
  await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0)
  await expect(page.getByText('SALE',{exact:true})).toHaveCount(0)
  const card=page.locator('.product-card').first();await card.hover()
  expect(await card.evaluate(node=>getComputedStyle(node).transform)).toBe('none')
})
test('load gate, viewport/tab lifecycle and concurrency budget',async({page})=>{
  let release:()=>void=()=>{}
  const gate=new Promise<void>(resolve=>{release=resolve})
  await page.route('**/images/holiday-hero*',async route=>{await gate;await route.continue()})
  await page.goto('/en-gb/',{waitUntil:'domcontentloaded'})
  await expect(page.locator('html')).toHaveAttribute('data-running-decorations','0')
  release();await page.waitForLoadState('load')
  await expect(page.locator('[data-seasonal-scene]')).toHaveAttribute('data-motion','running')
  const limit=page.viewportSize()!.width<=780?2:3
  expect(Number(await page.locator('html').getAttribute('data-running-decorations'))).toBeLessThanOrEqual(limit)
  await page.locator('[data-decoration="family"]').scrollIntoViewIfNeeded()
  await expect(page.locator('[data-seasonal-scene]')).toHaveAttribute('data-motion','paused')
  await expect(page.locator('[data-decoration="family"]')).toHaveAttribute('data-state','running')
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))})
  await expect(page.locator('html')).toHaveAttribute('data-running-decorations','0')
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))})
  await expect(page.locator('[data-decoration="family"]')).toHaveAttribute('data-state','running')
})
test('blocked storage, unavailable animation and no-JS all retain usable content',async({page,browser})=>{
  await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}})
  await page.route('**/animations/christmas/tree.json',route=>route.fulfill({status:503,body:'unavailable'}))
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/en-gb/')
  await expect(page.locator('[data-decoration="hero"]')).toHaveAttribute('data-state','error')
  await expect(page.locator('[data-decoration="hero"] .decoration-poster')).toBeVisible()
  await toggle(page);await expect(page.locator('html')).toHaveAttribute('data-effects','off')
  expect(errors).toEqual([])
  const context=await browser.newContext({javaScriptEnabled:false})
  const staticPage=await context.newPage();await staticPage.goto('/en-gb/')
  await expect(staticPage.locator('[data-scene-controls]')).toBeHidden()
  await expect(staticPage.locator('.decoration-poster').first()).toBeVisible()
  await expect(staticPage.locator('h1')).toBeVisible();await context.close()
})
test('two events, four widths, effects on/off and no console, CSP, asset or external decoration requests',async({page},testInfo)=>{
  test.setTimeout(120_000) // A batch of 18 captures, including two full-page mobile renderings.
  const errors:string[]=[],remote:string[]=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())})
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`)})
  page.on('request',request=>{if(!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))remote.push(request.url())})
  for(const [event,path] of [['christmas','/en-gb/'],['black-friday','/en-gb/events/black-friday/']])for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.goto(path!)
    await expect(page.locator('html')).toHaveAttribute('data-decorations-ready','true')
    for(const state of ['on','off']){
      if(await page.locator('html').getAttribute('data-effects')!==state)await toggle(page)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
      expect(Number(await page.locator('html').getAttribute('data-running-decorations'))).toBeLessThanOrEqual(width<=780?2:3)
      const overlaps=await page.evaluate(()=>{
        const protectedNodes=[...document.querySelectorAll('h1,h2,h3,p,a,button,select,.product-card')].filter(node=>node.checkVisibility()&&!node.closest('[data-decoration]'))
        return [...document.querySelectorAll<HTMLElement>('[data-decoration]')].flatMap(decoration=>{
          const art=decoration.getBoundingClientRect()
          if(decoration.dataset.decoration==='hero')return [] // Only overlays the hero's empty image corner.
          return protectedNodes.flatMap(node=>{
            const text=node.getBoundingClientRect()
            const intersect=art.width&&art.height&&text.width&&text.height&&Math.min(art.right,text.right)-Math.max(art.left,text.left)>1&&Math.min(art.bottom,text.bottom)-Math.max(art.top,text.top)>1
            return intersect?[`${decoration.dataset.decoration}: ${node.tagName} ${node.textContent?.trim().slice(0,40)}`]:[]
          })
        })
      })
      expect(overlaps).toEqual([])
      await page.evaluate(async()=>{
        await document.fonts.ready
        await Promise.all([...document.images].filter(image=>{const box=image.getBoundingClientRect();return box.bottom>0&&box.top<innerHeight}).map(image=>image.decode().catch(()=>{})))
      })
      await page.screenshot({path:testInfo.project.name==='desktop'?`docs/qa/decor-${event}-${width}-${state}.png`:testInfo.outputPath(`${event}-${width}-${state}.png`),scale:'css'})
      if(width===1440&&state==='on'){
        // Prime lazy media only in the test page; avoid slow touch-emulated scrolling.
        await page.evaluate(()=>document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(image=>{image.loading='eager'}))
        await page.waitForFunction(()=>[...document.images].every(image=>image.complete))
        await page.evaluate(async()=>{
          await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})))
          window.scrollTo({top:0,behavior:'instant'})
          await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))
        })
        await page.screenshot({path:testInfo.project.name==='desktop'?`docs/qa/decor-${event}-full.png`:testInfo.outputPath(`${event}-full.png`),fullPage:true,scale:'css'})
      }
    }
  }
  expect(errors).toEqual([]);expect(remote).toEqual([])
})
