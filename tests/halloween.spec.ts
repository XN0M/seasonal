import {test,expect,type Page} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
async function effects(page:Page,state:'on'|'off'){
  if(await page.locator('html').getAttribute('data-effects')===state)return
  if(!await page.locator('[data-effects-toggle]:visible').count())await page.locator('[data-menu-open]').click()
  const button=page.locator('[data-effects-toggle]:visible').first()
  await button.focus();await page.keyboard.press('Space')
  if(await page.getByRole('dialog').isVisible())await page.keyboard.press('Escape')
  await expect(page.locator('html')).toHaveAttribute('data-effects',state)
}
function contrast(foreground:number[],background:number[]){
  const luminance=(rgb:number[])=>rgb.map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index]!,0)
  const a=luminance(foreground),b=luminance(background)
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)
}
test('Halloween locale content, event shortcuts, truthful empty states and preserved events',async({page})=>{
  for(const locale of ['en-gb','de-de','fr-fr']){
    await page.goto(`/${locale}/`)
    await expect(page.locator('html')).toHaveAttribute('data-theme','halloween')
    await expect(page.locator('h1')).toContainText('Halloween')
    await expect(page.locator('[data-decoration]')).toHaveCount(6)
    await expect(page.locator('[data-santa],[data-scene-snow],[data-scene-controls],.scene-controls-space')).toHaveCount(0)
    await expect(page.locator('.quick-finder a').first()).toHaveAttribute('href',/event=halloween-2026/)
    await expect(page.locator('.header-cta')).toHaveAttribute('href',/event=halloween-2026/)
    await expect(page.locator('.budget-links a').first()).toHaveAttribute('href',/event=halloween-2026/)
    // Axe cannot resolve all gradient backgrounds; check actual scoped text colours
    // against the brightest hero-background stop, not just declared global tokens.
    const colours=await page.locator('.event-hero__copy>p,.event-hero__note p,.event-hero__note span').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).color.match(/\d+/g)!.slice(0,3).map(Number)))
    colours.forEach(colour=>expect(contrast(colour,[61,41,64])).toBeGreaterThanOrEqual(4.5))
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
    await page.goto(`/${locale}/events/halloween/`)
    await expect(page.locator('[data-decoration]')).toHaveCount(4)
    await expect(page.locator('[data-decoration="event-info"]')).toHaveAttribute('data-static','true')
    await expect(page.locator('.event-detail strong')).toContainText('2026')
    await expect(page.locator('.event-detail strong')).toContainText('31')
    await expect(page.locator('.event-empty')).toBeVisible()
    await expect(page.locator('.product-card,a[rel~="sponsored"]')).toHaveCount(0)
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
    await page.goto(`/${locale}/gift-finder/?event=halloween-2026`)
    await expect(page.locator('.finder')).toHaveAttribute('data-ready','true')
    await expect(page.locator('.empty-event-links a')).toHaveCount(2)
    await expect(page.locator('.finder-concepts')).toHaveCount(0)
    await expect(page.locator('[data-decoration]')).toHaveCount(2)
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
  }
  await page.goto('/en-gb/events/black-friday/')
  await expect(page.locator('html')).toHaveAttribute('data-theme','black-friday')
  await page.goto('/en-gb/events/holiday-gift-season/')
  await expect(page.locator('html')).toHaveAttribute('data-theme','christmas')
  await expect(page.locator('[data-santa]')).toHaveCount(1)
})
test('reduced-motion opt-in/off is accessible and does not restore UI motion',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  for(const locale of ['en-gb','de-de','fr-fr']){
    await page.goto(`/${locale}/`)
    await effects(page,'off')
    await expect(page.locator('html')).toHaveAttribute('data-running-decorations','0')
    await effects(page,'on')
    await expect(page.locator('[data-decoration="hero"]')).toHaveAttribute('data-state','running')
    expect(await page.locator('.event-hero .button').first().evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration))).toBeLessThan(.01)
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])
    await page.screenshot({path:info.project.name==='desktop'?`docs/qa/halloween-reduced-${locale}.png`:info.outputPath(`reduced-${locale}.png`),scale:'css'})
  }
})
test('four widths, on/off safe zones, assets/CSP and no external decoration requests',async({page},info)=>{
  test.setTimeout(120_000)
  const errors:string[]=[],external:string[]=[]
  page.on('pageerror',e=>errors.push(e.message))
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)})
  page.on('request',r=>{if(!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url())})
  for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.goto('/en-gb/')
    await expect(page.locator('html')).toHaveAttribute('data-decorations-ready','true')
    for(const state of ['on','off'] as const){
      await effects(page,state)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
      expect(Number(await page.locator('html').getAttribute('data-running-decorations'))).toBeLessThanOrEqual(width<=780?2:3)
      const collisions=await page.evaluate(()=>{
        const protectedNodes=[...document.querySelectorAll('h1,h2,h3,p,a,button,select,.product-card')].filter(node=>node.checkVisibility()&&!node.closest('[data-decoration]'))
        return [...document.querySelectorAll<HTMLElement>('[data-decoration]')].filter(node=>node.dataset.decoration!=='hero').flatMap(node=>{
          const a=node.getBoundingClientRect()
          return protectedNodes.flatMap(target=>{const b=target.getBoundingClientRect();return Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1?[`${node.dataset.decoration}: ${target.tagName}`]:[]})
        })
      })
      expect(collisions).toEqual([])
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(image=>image.getBoundingClientRect().top<innerHeight).map(image=>image.decode().catch(()=>{})))})
      expect(await page.locator('.event-hero__arch img').evaluate(node=>(node as HTMLImageElement).currentSrc)).toContain(width<=500?'halloween-hero-mobile.svg':width<=780?'halloween-hero-tablet.svg':'halloween-hero.svg')
      expect(await page.locator('.event-hero__arch img').evaluate(node=>getComputedStyle(node).objectFit)).toBe('cover')
      await expect(page.locator('[data-decoration="hero"] .halloween-moon')).toHaveCount(0)
      const contained=await page.locator('[data-decoration="hero"]').evaluate(node=>{
        const art=node.getBoundingClientRect(),stage=node.closest('.seasonal-stage')!.getBoundingClientRect()
        return art.top>=stage.top&&art.bottom<=stage.bottom&&art.left>=stage.left&&art.right<=stage.right
      })
      expect(contained).toBe(true)
      await page.screenshot({path:info.project.name==='desktop'?`docs/qa/halloween-${width}-${state}.png`:info.outputPath(`${width}-${state}.png`),scale:'css'})
    }
    await page.goto('/en-gb/events/halloween/')
    for(const state of ['on','off'] as const){
      await effects(page,state)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)
      await expect(page.locator('[data-decoration="event-info"]')).toHaveAttribute('data-state','static')
      expect(Number(await page.locator('html').getAttribute('data-running-decorations'))).toBeLessThanOrEqual(width<=780?2:3)
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(image=>image.getBoundingClientRect().top<innerHeight).map(image=>image.decode().catch(()=>{})))})
      await page.screenshot({path:info.project.name==='desktop'?`docs/qa/halloween-hub-${width}-${state}.png`:info.outputPath(`hub-${width}-${state}.png`),scale:'css'})
    }
  }
  await page.goto('/en-gb/')
  await effects(page,'on')
  await page.evaluate(()=>document.querySelectorAll<HTMLImageElement>('img').forEach(image=>image.loading='eager'))
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete))
  await page.evaluate(async()=>{await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})))})
  await page.screenshot({path:info.project.name==='desktop'?'docs/qa/halloween-full.png':info.outputPath('full.png'),fullPage:true,scale:'css'})
  expect(errors).toEqual([]);expect(external).toEqual([])
})
