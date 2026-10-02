import {contentSchema,type ManagedContent} from './contracts'
import {brandRegistry as base} from '../../data/brand-base'
export function initialContent():ManagedContent {
  return {schemaVersion:1,activeEventId:'halloween-2026',brands:Object.fromEntries(base.profiles.map(p=>[p.id,{summary:p.summary,introduction:p.introduction,selectionNote:p.selectionNote,coverProductId:base.featuredProducts.find(photo=>photo.brandId===p.id)!.id}])),brandLinkStates:Object.fromEntries(base.links.map(link=>[link.brandId,'active' as const])),eventPriority:structuredClone(base.eventPriority) as ManagedContent['eventPriority'],campaigns:[],humanReview:'pending'}
}
export function validateContent(input:unknown):ManagedContent {
  const content=contentSchema.parse(input),ids=base.profiles.map(p=>p.id)
  if(Object.keys(content.brandLinkStates).length===0)content.brandLinkStates=Object.fromEntries(base.links.map(link=>[link.brandId,'active' as const]))
  if(Object.keys(content.brandLinkStates).sort().join('|')!==[...ids].sort().join('|'))throw new Error('Exactly ten brand visibility states required')
  if(Object.keys(content.brands).sort().join('|')!==[...ids].sort().join('|'))throw new Error('Exactly the ten approved brands are required')
  for(const [id,edit]of Object.entries(content.brands))if(!base.featuredProducts.some(photo=>photo.id===edit.coverProductId&&photo.brandId===id))throw new Error(`Invalid existing image for ${id}`)
  for(const [event,order]of Object.entries(content.eventPriority)) {
    const allowed=base.eventPriority[event]!
    if(new Set(order).size!==order.length||[...order].sort().join('|')!==[...allowed].sort().join('|'))throw new Error(`Event membership is immutable: ${event}`)
  }
  const slugs=new Set<string>()
  for(const campaign of content.campaigns){if(!ids.includes(campaign.brandId)||slugs.has(campaign.slug)||campaign.slug.startsWith('brand-'))throw new Error('Invalid campaign identity');slugs.add(campaign.slug)}
  return content
}
