import type { BrandAffiliateLink, BrandCategory, BrandProfile, FeaturedProduct, Locale, LocalizedText, Market, Merchant, Recipient } from './types'

export interface BrandRegistry {
  profiles: BrandProfile[]
  links: BrandAffiliateLink[]
  merchants: Merchant[]
  featuredProducts: FeaturedProduct[]
  eventPriority: Record<string, string[]>
}
export interface BrandCardModel {
  profile: BrandProfile
  link: BrandAffiliateLink | undefined
  products: FeaturedProduct[]
  relevant: boolean
  fulfilment: { status: 'verified' | 'unknown' | 'restricted'; note: LocalizedText; sourceUrl?: string; checkedAt?: string }
}
export function brandLinkValidation(link: BrandAffiliateLink, profile: BrandProfile, merchant: Merchant, market: Market, now = new Date(), locale: Locale = market === 'GB' ? 'en-gb' : market === 'DE' ? 'de-de' : 'fr-fr') {
  const reasons: string[] = []
  if (link.status !== 'active' || profile.status !== 'active' || merchant.status !== 'active') reasons.push('inactive')
  if (link.brandId !== profile.id || link.merchantId !== merchant.id) reasons.push('record_mismatch')
  if (link.approval.basis !== 'owner-confirmed' || !Number.isFinite(Date.parse(link.approval.confirmedAt)) || !link.locales.includes(locale)) reasons.push('programme_not_confirmed')
  if (!link.trackingId) reasons.push('missing_tracking')
  if (link.expiresAt && (!Number.isFinite(Date.parse(link.expiresAt)) || Date.parse(link.expiresAt) <= now.getTime())) reasons.push('expired')
  try {
    const url = new URL(link.affiliateUrl)
    if (url.protocol !== 'https:' || url.username || url.password) reasons.push('unsafe_url')
    if (!merchant.allowedHosts.includes(url.hostname.replace(/^www\./, ''))) reasons.push('host_not_allowed')
    if (url.searchParams.get(link.network === 'GoAffPro' ? 'ref' : 'rfsn') !== link.trackingId) reasons.push('tracking_mismatch')
  } catch { reasons.push('invalid_url') }
  return {valid:reasons.length === 0,reasons}
}
export function fulfilmentNotice(profile: BrandProfile, market: Market): BrandCardModel['fulfilment'] {
  const restriction = profile.marketRestrictions[market]
  if (restriction) return { status:'restricted', ...restriction }
  const evidence = profile.marketChecks[market]
  if (evidence) return { status:'verified', ...evidence }
  return { status:'unknown', note: profile.fulfilmentKind === 'digital' ? {
    'en-gb':'German-language digital song service. Confirm language, delivery format and processing time with the brand before ordering.',
    'de-de':'Digitaler Liedservice in deutscher Sprache. Sprache, Dateiformat und Bearbeitungszeit vor der Bestellung beim Anbieter prüfen.',
    'fr-fr':'Service de chanson numérique en allemand. Confirmez la langue, le format de réception et le délai de création auprès de la marque.'
  } : {
    'en-gb':'Confirm delivery to your country with the brand before ordering.',
    'de-de':'Prüfen Sie vor der Bestellung beim Anbieter, ob eine Lieferung in Ihr Land möglich ist.',
    'fr-fr':'Confirmez la livraison dans votre pays auprès de la marque avant de commander.'
  } }
}
export function brandCards(registry: BrandRegistry, market: Market, eventId: string, locale: Locale, options: { relevantOnly?: boolean; availableOnly?: boolean; categories?: readonly BrandCategory[]; recipient?: Recipient } = {}): BrandCardModel[] {
  const priorities = registry.eventPriority[eventId] || []
  return registry.profiles.filter(profile=>(profile.status==='active'||profile.status==='paused') && (!options.categories || options.categories.includes(profile.category)) && (!options.recipient || profile.recipients.includes(options.recipient))).map(profile=>{
    const link=registry.links.find(item=>item.brandId===profile.id && registry.merchants.some(merchant=>merchant.id===item.merchantId && brandLinkValidation(item,profile,merchant,market,new Date(),locale).valid))
    return {profile,link,products:registry.featuredProducts.filter(item=>item.brandId===profile.id).slice(0,6),relevant:priorities.includes(profile.id),fulfilment:fulfilmentNotice(profile,market)}
  }).filter(card=>(!options.availableOnly || card.link) && (!options.relevantOnly || card.relevant)).sort((a,b)=>{
    const availability=Number(Boolean(b.link))-Number(Boolean(a.link))
    if (availability) return availability
    const confidence = {verified:0,unknown:1,restricted:2}
    const delivery = confidence[a.fulfilment.status] - confidence[b.fulfilment.status]
    if (delivery) return delivery
    const rank=(id:string)=>priorities.includes(id)?priorities.indexOf(id):Number.MAX_SAFE_INTEGER
    return rank(a.profile.id)-rank(b.profile.id) || a.profile.name.localeCompare(b.profile.name,locale)
  })
}
