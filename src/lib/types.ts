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
  productId: string
  brandId: string
  merchantId: string
  market: Market
  locale: Locale
  eventId: string
  placement: string
  trackingId: string
}
