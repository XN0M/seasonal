import {describe,expect,it} from 'vitest'
import {brandProfiles,brandRegistry,brandLinks} from '@/data/brands'
import {brandCards,brandLinkValidation} from '@/lib/brands'
import {brandRegistrySchema} from '@/lib/schemas'
import {readAffiliateClick} from '@/lib/analytics/affiliate-click'
import {alternateRoutes} from '@/lib/routes'
import type {FeaturedProduct,LocalizedText} from '@/lib/types'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'

const all=text('Fixture'), now=new Date('2026-10-01')
function text(value:string):LocalizedText{return {'en-gb':value,'de-de':value,'fr-fr':value}}
const product:FeaturedProduct={id:'fixture-product',brandId:'world-of-cosmetics',name:all,description:all,imageAlt:all,sourceUrl:'https://www.worldofcosmetics.co.uk/fixture',permission:'Synthetic QA only; never a merchant product',image:{src:'/images/brands/fixture-320.webp',width:320,height:400,sources:[{width:320,webp:'/images/brands/fixture-320.webp',avif:'/images/brands/fixture-320.avif'}]}}
describe('brand discovery and eligibility',()=>{
  it('has ten original links and twenty source-recorded images covering every brand',()=>{
    expect(brandProfiles).toHaveLength(10)
    expect(brandRegistry.featuredProducts).toHaveLength(20)
    const provenance=JSON.parse(readFileSync('docs/assets/brand-image-provenance.json','utf8')) as Array<{id:string;originalFile:string;sha256:string;sourceImageUrl:string}>
    for(const profile of brandProfiles)expect(brandRegistry.featuredProducts.some(product=>product.brandId===profile.id)).toBe(true)
    for(const product of brandRegistry.featuredProducts){
      const record=provenance.find(item=>item.id===product.id)!
      expect(record.sourceImageUrl).toBe(product.sourceImageUrl)
      expect(createHash('sha256').update(readFileSync(`assets/originals/brands/${record.originalFile}`)).digest('hex')).toBe(record.sha256)
      expect(product.permission).toContain('Owner-confirmed affiliate image use')
    }
    expect(brandLinks.find(link=>link.brandId==='toybox')?.affiliateUrl).toBe('https://toybox.com/?rfsn=9351560.b4e439&utm_source=refersion&utm_medium=affiliate&utm_campaign=9351560.b4e439')
    expect(brandLinks.find(link=>link.brandId==='original-magic-art')?.affiliateUrl).toBe('https://original-magic-art.myshopify.com/?rfsn=9351615.20c9b5')
    expect(brandLinks.map(link=>new URL(link.affiliateUrl).searchParams.get(link.network==='GoAffPro'?'ref':'rfsn'))).toEqual(['eghgrllo','NH','NH','tjsmumqp','iotwymlr','NH','9351560.b4e439','9351615.20c9b5','xebmcrix','gfwfqlfm'])
  })
  it('opens approved links independently of delivery evidence and orders by fulfilment confidence',()=>{
    const ids=(market:'GB'|'DE'|'FR',event:string)=>brandCards(brandRegistry,market,event,'en-gb',{availableOnly:true,relevantOnly:true}).map(card=>card.profile.id)
    expect(ids('GB','halloween-2026')).toEqual(['world-of-cosmetics'])
    expect(ids('FR','halloween-2026')).toEqual(['world-of-cosmetics'])
    expect(ids('GB','black-friday-2026')).toEqual(['toybox','world-of-cosmetics','blue-oasis','batterie-externe-shop','be-ove','cosmic-garb'])
    expect(ids('GB','holiday-2026')).toHaveLength(8)
    expect(ids('DE','holiday-2026')[0]).toBe('schenkdeinlied')
    expect(ids('FR','holiday-2026')[0]).toBe('cocon-de-lune')
    expect(brandCards(brandRegistry,'GB','halloween-2026','en-gb')).toHaveLength(10)
  })
  it('accepts unknown shipping but rejects paused records, expiry, host and tracking tampering',()=>{
    const link=brandLinks[0]!,profile=brandProfiles[0]!,merchant=brandRegistry.merchants[0]!
    expect(brandLinkValidation(link,profile,merchant,'GB',now).valid).toBe(true)
    expect(brandLinkValidation(link,profile,merchant,'DE',now).valid).toBe(true)
    for(const [market,locale]of [['GB','en-gb'],['DE','de-de'],['FR','fr-fr']] as const){expect(brandCards(brandRegistry,market,'halloween-2026',locale,{availableOnly:true})).toHaveLength(10)}
    expect(brandCards(brandRegistry,'DE','halloween-2026','de-de').find(card=>card.profile.id===profile.id)?.fulfilment.status).toBe('restricted')
    expect(brandLinkValidation({...link,affiliateUrl:'https://evil.example/?ref=eghgrllo'},profile,merchant,'GB',now).reasons).toContain('host_not_allowed')
    expect(brandLinkValidation({...link,affiliateUrl:'https://www.worldofcosmetics.co.uk/?ref=wrong'},profile,merchant,'GB',now).reasons).toContain('tracking_mismatch')
    expect(brandLinkValidation({...link,expiresAt:now.toISOString()},profile,merchant,'GB',now).reasons).toContain('expired')
    expect(brandLinkValidation(link,{...profile,status:'paused'},merchant,'GB',now).valid).toBe(false)
  })
  it('fails invalid reference, locale, market evidence and image contracts at build validation',()=>{
    expect(brandRegistrySchema.safeParse({...brandRegistry,links:[{...brandLinks[0],locales:['unknown']}]}).success).toBe(false)
    expect(brandRegistrySchema.safeParse({...brandRegistry,profiles:[{...brandProfiles[0],summary:{'en-gb':'Only English'}}]}).success).toBe(false)
    expect(brandRegistrySchema.safeParse({...brandRegistry,eventPriority:{'halloween-2026':['unknown']}}).success).toBe(false)
    expect(brandRegistrySchema.safeParse({...brandRegistry,featuredProducts:[{...product,image:{...product.image,src:'https://external.example/product.jpg'}}]}).success).toBe(false)
  })
  it('handles zero, one, three and six images without creating shopping offers',()=>{
    for(const count of [0,1,3,6]){
      const products=Array.from({length:count},(_,index)=>({...product,id:`fixture-${index}`}))
      const registry={...brandRegistry,featuredProducts:products}
      expect(brandRegistrySchema.safeParse(registry).success).toBe(true)
      expect(brandCards(registry,'GB','halloween-2026','en-gb')[0]?.products).toHaveLength(count)
    }
  })
  it('maps the existing home slots to real brand categories without mixing concept products',()=>{
    const women=brandCards(brandRegistry,'GB','halloween-2026','en-gb',{recipient:'women',availableOnly:true})
    expect(women.map(card=>card.profile.id).slice(0,4)).toEqual(['world-of-cosmetics','blue-oasis','be-ove','cocon-de-lune'])
    const family=brandCards(brandRegistry,'FR','halloween-2026','fr-fr',{categories:['home','creative']})
    expect(family.map(card=>card.profile.id)).toEqual(['cocon-de-lune','toybox'])
    expect([...women,...family].every(card=>card.products.length>0)).toBe(true)
  })
  it('preserves brand slugs in localized routes',()=>{
    expect(alternateRoutes('/en-gb/brands/world-of-cosmetics/')).toEqual({'en-gb':'/en-gb/brands/world-of-cosmetics/','de-de':'/de-de/brands/world-of-cosmetics/','fr-fr':'/fr-fr/brands/world-of-cosmetics/'})
  })
})
describe('affiliate payload compatibility',()=>{
  const base={brandId:'world-of-cosmetics',merchantId:'world-of-cosmetics-merchant',market:'GB',locale:'en-gb',eventId:'halloween-2026',placement:'home-brand',trackingId:'eghgrllo'}
  const href='https://www.worldofcosmetics.co.uk/?ref=eghgrllo'
  it('allows brand clicks without product IDs/expiry and identifies featured thumbnails',()=>{
    const brand={...base,targetType:'brand'}
    expect(readAffiliateClick(JSON.stringify(brand),href,undefined,now.getTime())).toEqual(brand)
    const featured={...brand,featuredProductId:'fixture'}
    expect(readAffiliateClick(JSON.stringify(featured),href)).toEqual(featured)
    expect(readAffiliateClick(JSON.stringify(brand),href,'2020-01-01T00:00:00Z')).toBeUndefined()
  })
  it('retains legacy product expiry checks and rejects malformed or unsafe payloads',()=>{
    const legacy={...base,productId:'p1'}
    expect(readAffiliateClick(JSON.stringify(legacy),href,'2099-01-01T00:00:00Z')).toEqual(legacy)
    expect(readAffiliateClick(JSON.stringify(legacy),href)).toBeUndefined()
    for(const payload of [{...base,targetType:'unknown'},{...base,targetType:'brand',trackingId:'bad'},{...base,targetType:'brand',market:'US'},null])expect(readAffiliateClick(JSON.stringify(payload),href)).toBeUndefined()
    expect(readAffiliateClick('{bad',href)).toBeUndefined()
    expect(readAffiliateClick(JSON.stringify({...base,targetType:'brand'}),'https://user:pass@www.worldofcosmetics.co.uk/?ref=eghgrllo')).toBeUndefined()
  })
})
