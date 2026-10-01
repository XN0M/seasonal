import {z} from 'astro/zod'
import { brandCategories } from './types'
const localized=z.object({'en-gb':z.string().min(1),'de-de':z.string().min(1),'fr-fr':z.string().min(1)})
const status=z.enum(['active','paused','preview','retired'])
const market=z.enum(['GB','DE','FR'])
const locale=z.enum(['en-gb','de-de','fr-fr'])
const iso=z.iso.datetime({offset:true})
const brand=z.object({id:z.string().min(1),name:z.string().min(1),status})
const merchant=z.object({id:z.string().min(1),name:z.string().min(1),status,markets:z.array(market).min(1),allowedHosts:z.array(z.string().regex(/^[a-z0-9.-]+$/))})
const product=z.object({id:z.string().min(1),brandId:z.string().min(1),name:localized,why:localized,bestFor:localized,category:z.enum(['beauty','self-care','accessories','toys','family']),recipients:z.array(z.enum(['women','family','children','teens'])).min(1),budgetBand:z.enum(['under-25','25-50','50-100','over-100']),events:z.array(z.string()).min(1),image:z.string().startsWith('/images/'),imageAlt:localized,evidenceUrls:z.array(z.url()),status})
const offer=z.object({id:z.string().min(1),productId:z.string(),merchantId:z.string(),market,currency:z.enum(['GBP','EUR']),affiliateUrl:z.url().nullable(),trackingId:z.string().nullable(),verifiedAt:iso,expiresAt:iso,status,price:z.number().nonnegative().optional(),salePrice:z.number().nonnegative().optional()}).superRefine((value,ctx)=>{if(value.salePrice!==undefined&&(value.price===undefined||value.salePrice>value.price))ctx.addIssue({code:'custom',message:'salePrice requires a price and cannot exceed it'})})
const event=z.object({id:z.string().min(1),slug:localized,name:localized,eyebrow:localized,headline:localized,description:localized,theme:z.enum(['halloween','black-friday','christmas','winter']),image:z.string(),status,datesByMarket:z.record(market,z.object({startsAt:iso,eventAt:iso,endsAt:iso,timezone:z.string()})),phasesByMarket:z.record(market,z.array(z.object({id:z.enum(['inspiration','early-shopping','deal-window','last-chance','post-event']),startsAt:iso,endsAt:iso})))})
export const catalogSchema=z.object({brands:z.array(brand),merchants:z.array(merchant),products:z.array(product),offers:z.array(offer),events:z.array(event)}).superRefine((data,ctx)=>{
  const ids=(items:Array<{id:string}>)=>new Set(items.map(item=>item.id))
  for(const key of ['brands','merchants','products','offers','events'] as const)if(ids(data[key]).size!==data[key].length)ctx.addIssue({code:'custom',path:[key],message:'Duplicate IDs'})
  for(const item of data.products){if(!ids(data.brands).has(item.brandId)||item.events.some(id=>!ids(data.events).has(id)))ctx.addIssue({code:'custom',path:['products',item.id],message:'Unknown brand/event reference'})}
  for(const item of data.offers){if(!ids(data.products).has(item.productId)||!ids(data.merchants).has(item.merchantId))ctx.addIssue({code:'custom',path:['offers',item.id],message:'Unknown product/merchant reference'})}
  for(const item of data.events)for(const code of ['GB','DE','FR'] as const){const phases=item.phasesByMarket[code];for(let index=0;index<phases.length;index++){const phase=phases[index]!;if(Date.parse(phase.startsAt)>=Date.parse(phase.endsAt)||(index>0&&phases[index-1]!.endsAt!==phase.startsAt))ctx.addIssue({code:'custom',path:['events',item.id,code],message:'Phases must be chronological and contiguous'})}}
})

const httpsUrl = z.url().superRefine((value, ctx) => {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password) ctx.addIssue({ code: 'custom', message: 'Expected HTTPS URL without credentials' })
})
const localImage = z.string().regex(/^\/images\/brands\/[a-z0-9/-]+\.(webp|avif|png|jpg|jpeg)$/)
export const featuredProductSchema = z.object({
  id:z.string().regex(/^[a-z0-9-]+$/), brandId:z.string().min(1), name:localized, description:localized, imageAlt:localized,
  image:z.object({src:localImage,width:z.number().int().positive(),height:z.number().int().positive(),sources:z.array(z.object({width:z.number().int().positive(),webp:localImage,avif:localImage})).min(1)}),
  sourceUrl:httpsUrl, sourceImageUrl:httpsUrl.optional(), permission:z.string().min(1),
})
export const brandRegistrySchema = z.object({
  profiles:z.array(brand.extend({slug:z.string().regex(/^[a-z0-9-]+$/),category:z.enum(brandCategories),summary:localized,introduction:localized,selectionNote:localized,
    recipients:z.array(z.enum(['women','family','children','teens'])).min(1),fulfilmentKind:z.enum(['physical','digital']),
    marketRestrictions:z.partialRecord(market,z.object({checkedAt:iso,sourceUrl:httpsUrl,note:localized})),
    marketChecks:z.partialRecord(market,z.object({checkedAt:iso,sourceUrl:httpsUrl,note:localized})),evidenceUrls:z.array(httpsUrl).min(1)})),
  merchants:z.array(merchant.extend({markets:z.array(market)})),
  links:z.array(z.object({id:z.string().min(1),brandId:z.string().min(1),merchantId:z.string().min(1),network:z.enum(['GoAffPro','Refersion']),affiliateUrl:httpsUrl,trackingId:z.string().min(1),locales:z.array(locale).min(1),approval:z.object({basis:z.literal('owner-confirmed'),confirmedAt:iso}),status,checkedAt:iso,expiresAt:iso.optional()})),
  featuredProducts:z.array(featuredProductSchema),
  eventPriority:z.record(z.string(),z.array(z.string())),
}).superRefine((data,ctx)=>{
  for (const key of ['profiles','merchants','links','featuredProducts'] as const) {
    if (new Set(data[key].map(item=>item.id)).size!==data[key].length) ctx.addIssue({code:'custom',path:[key],message:'Duplicate IDs'})
  }
  if (new Set(data.profiles.map(item=>item.slug)).size!==data.profiles.length) ctx.addIssue({code:'custom',path:['profiles'],message:'Duplicate brand slugs'})
  for (const link of data.links) {
    const profile=data.profiles.find(item=>item.id===link.brandId), seller=data.merchants.find(item=>item.id===link.merchantId)
    if (!profile || !seller) {ctx.addIssue({code:'custom',path:['links',link.id],message:'Unknown brand/merchant'});continue}
    const url=new URL(link.affiliateUrl), parameter=link.network==='GoAffPro'?'ref':'rfsn'
    if (!seller.allowedHosts.includes(url.hostname.replace(/^www\./,'')) || url.searchParams.get(parameter)!==link.trackingId) ctx.addIssue({code:'custom',path:['links',link.id],message:'Affiliate host or tracking parameter does not match registry'})
    if(new Set(link.locales).size!==link.locales.length)ctx.addIssue({code:'custom',path:['links',link.id],message:'Duplicate affiliate locale'})
  }
  for (const product of data.featuredProducts) if (!data.profiles.some(item=>item.id===product.brandId)) ctx.addIssue({code:'custom',path:['featuredProducts',product.id],message:'Unknown brand'})
  for (const [eventId,ids] of Object.entries(data.eventPriority)) {
    if (new Set(ids).size!==ids.length || ids.some(id=>!data.profiles.some(item=>item.id===id))) ctx.addIssue({code:'custom',path:['eventPriority',eventId],message:'Unknown or duplicate priority brand'})
  }
})
