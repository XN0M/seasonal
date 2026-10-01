import type {BrandCardModel} from './brands'
import {brandCategories,marketCodes,type BrandCategory,type BrandProfile,type FeaturedProduct,type Locale,type Market,type Recipient} from './types'
import {localeConfig} from './i18n'
export interface BrandFinderFilters {recipient:Recipient|'all';category:BrandCategory|'all';event:string;market:Market}
export interface BrandFinderCard {
  profile:Pick<BrandProfile,'id'|'name'|'slug'|'category'|'summary'|'recipients'>
  link:BrandCardModel['link']
  fulfilment:BrandCardModel['fulfilment']
  products:Array<Pick<FeaturedProduct,'image'|'imageAlt'>>
}
// Keep long editorial bodies and nonvisible catalog galleries out of island props.
export function finderCard(card:BrandCardModel):BrandFinderCard {
  const {id,name,slug,category,summary,recipients}=card.profile
  return {profile:{id,name,slug,category,summary,recipients},link:card.link,fulfilment:card.fulfilment,products:card.products.slice(0,1).map(product=>({image:{...product.image,sources:product.image.sources.filter(source=>source.width<=640)},imageAlt:product.imageAlt}))}
}
const recipients=['women','family','children','teens','all'] as const
export function readBrandFinder(url:URL,locale:Locale,eventIds:readonly string[]) {
  const requested=url.searchParams.get('category')||'all',aliases:Record<string,string>={accessories:'fashion',toys:'creative',family:'home'},category=aliases[requested]||requested
  const recipient=url.searchParams.get('recipient')||'all',event=url.searchParams.get('event')||'all',market=url.searchParams.get('market')||localeConfig[locale].market
  return {filters:{recipient:recipients.includes(recipient as Recipient|'all')?recipient as Recipient|'all':'all',category:[...brandCategories,'all'].includes(category)?category as BrandCategory|'all':'all',event:eventIds.includes(event)?event:'all',market:marketCodes.includes(market as Market)?market as Market:localeConfig[locale].market},migrated:url.searchParams.has('budget') || requested!==category}
}
export function brandFinderUrl(url:URL,filters:BrandFinderFilters,locale:Locale) {
  const next=new URL(url);next.searchParams.delete('budget')
  for(const [key,value]of Object.entries(filters)){if(value==='all'||(key==='market'&&value===localeConfig[locale].market))next.searchParams.delete(key);else next.searchParams.set(key,value)}
  return `${next.pathname}${next.search}${next.hash}`
}
export type BrandFilterCandidate=Pick<BrandFinderCard,'link'|'fulfilment'> & {profile:Pick<BrandFinderCard['profile'],'id'|'name'|'category'|'recipients'>}
export function findBrands<T extends BrandFilterCandidate>(cards:readonly T[],filters:BrandFinderFilters,priority:readonly string[],locale:Locale):T[] {
  const confidence={verified:0,unknown:1,restricted:2},rank=(id:string)=>priority.includes(id)?priority.indexOf(id):Number.MAX_SAFE_INTEGER
  return cards.filter(card=>card.link && (filters.recipient==='all'||card.profile.recipients.includes(filters.recipient)) && (filters.category==='all'||card.profile.category===filters.category) && (filters.event==='all'||priority.includes(card.profile.id))).sort((a,b)=>confidence[a.fulfilment.status]-confidence[b.fulfilment.status] || rank(a.profile.id)-rank(b.profile.id) || a.profile.name.localeCompare(b.profile.name,locale))
}
