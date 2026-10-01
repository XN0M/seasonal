export const localeCodes = ['en-gb', 'de-de', 'fr-fr'] as const
export const marketCodes = ['GB', 'DE', 'FR'] as const

export type Locale = (typeof localeCodes)[number]
export type Market = (typeof marketCodes)[number]
export type Currency = 'GBP' | 'EUR'
export type EventPhase = 'inspiration' | 'early-shopping' | 'deal-window' | 'last-chance' | 'post-event'
export type ProductCategory = 'beauty' | 'self-care' | 'accessories' | 'toys' | 'family'
export type Recipient = 'women' | 'family' | 'children' | 'teens'
export type Status = 'active' | 'paused' | 'preview' | 'retired'

export type LocalizedText = Record<Locale, string>

export interface EventDates {
  startsAt: string
  eventAt: string
  endsAt: string
  timezone: string
}

export interface CampaignPhase {
  id: EventPhase
  startsAt: string
  endsAt: string
}

export interface SeasonalEvent {
  id: string
  slug: LocalizedText
  name: LocalizedText
  eyebrow: LocalizedText
  headline: LocalizedText
  description: LocalizedText
  datesByMarket: Record<Market, EventDates>
  phasesByMarket: Record<Market, CampaignPhase[]>
  theme: 'halloween' | 'black-friday' | 'christmas' | 'winter'
  image: string
  status: Status
}

export interface Brand {
  id: string
  name: string
  status: Status
}

export const brandCategories = ['beauty', 'self-care', 'fashion', 'home', 'personalised', 'creative', 'hobby', 'tech'] as const
export type BrandCategory = (typeof brandCategories)[number]
export interface BrandProfile extends Brand {
  slug: string
  category: BrandCategory
  summary: LocalizedText
  introduction: LocalizedText
  selectionNote: LocalizedText
  recipients: Recipient[]
  fulfilmentKind: 'physical' | 'digital'
  marketRestrictions: Partial<Record<Market, { checkedAt: string; sourceUrl: string; note: LocalizedText }>>
  marketChecks: Partial<Record<Market, { checkedAt: string; sourceUrl: string; note: LocalizedText }>>
  evidenceUrls: string[]
}
export interface BrandAffiliateLink {
  id: string
  brandId: string
  merchantId: string
  network: 'GoAffPro' | 'Refersion'
  affiliateUrl: string
  trackingId: string
  locales: Locale[]
  approval: { basis: 'owner-confirmed'; confirmedAt: string }
  status: Status
  checkedAt: string
  expiresAt?: string
}
export interface BrandImage {
  src: string
  width: number
  height: number
  sources: Array<{ width: number; webp: string; avif: string }>
}
export interface FeaturedProduct {
  id: string
  brandId: string
  name: LocalizedText
  description: LocalizedText
  imageAlt: LocalizedText
  image: BrandImage
  sourceUrl: string
  sourceImageUrl?: string | undefined
  permission: string
}

export interface Merchant {
  id: string
  name: string
  markets: Market[]
  allowedHosts: string[]
  status: Status
}

export interface Product {
  id: string
  brandId: string
  name: LocalizedText
  why: LocalizedText
  bestFor: LocalizedText
  category: ProductCategory
  recipients: Recipient[]
  budgetBand: 'under-25' | '25-50' | '50-100' | 'over-100'
  events: string[]
  image: string
  imageAlt: LocalizedText
  evidenceUrls: string[]
  status: Status
}

export interface Offer {
  id: string
  productId: string
  merchantId: string
  market: Market
  currency: Currency
  affiliateUrl: string | null
  trackingId: string | null
  price?: number
  salePrice?: number
  verifiedAt: string
  expiresAt: string
  shippingNote?: LocalizedText
  status: Status
}

export interface AffiliateClickPayload {
  targetType?: 'brand' | 'product'
  productId?: string
  featuredProductId?: string
  brandId: string
  merchantId: string
  market: Market
  locale: Locale
  eventId: string
  placement: string
  trackingId: string
}
