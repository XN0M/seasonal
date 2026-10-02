import {brandRegistry as base} from './brand-base'
import snapshot from '../generated/content.json'
import {validateContent} from '../lib/admin/content'
const content=snapshot.content===null?null:validateContent(snapshot.content)
export const brandProfiles=base.profiles.map(profile=>({...profile,...content?.brands[profile.id]}))
export const brandLinks=base.links.map(link=>({...link,status:content?.brandLinkStates[link.brandId]??link.status}))
export const brandMerchants=base.merchants
export const brandEventPriority:Record<string,string[]>=content?.eventPriority??base.eventPriority
export const featuredProducts=[...base.featuredProducts].sort((a,b)=>Number(content?.brands[b.brandId]?.coverProductId===b.id)-Number(content?.brands[a.brandId]?.coverProductId===a.id))
export const brandRegistry={profiles:brandProfiles,links:brandLinks,merchants:brandMerchants,featuredProducts,eventPriority:brandEventPriority}
export const publishedCampaigns=content?.campaigns??[]
export const servedRevisionId=snapshot.revisionId
