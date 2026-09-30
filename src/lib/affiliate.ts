import type { Brand, Market, Merchant, Offer, Product } from './types'
import { localeConfig } from './i18n'

const DAY = 86_400_000

export const offerValidation = (offer: Offer, product: Product, merchant: Merchant, now = new Date(), brand?: Brand, market: Market = offer.market) => {
  const reasons: string[] = []
  if (offer.status !== 'active') reasons.push('offer_inactive')
  if (product.status !== 'active') reasons.push('product_inactive')
  if (merchant.status !== 'active') reasons.push('merchant_inactive')
  if (brand && (brand.id !== product.brandId || brand.status !== 'active')) reasons.push('brand_inactive')
  if (offer.productId !== product.id || offer.merchantId !== merchant.id) reasons.push('record_mismatch')
  if (!offer.affiliateUrl || !offer.trackingId) reasons.push('missing_tracking')
  if (!merchant.markets.includes(market) || offer.market !== market) reasons.push('market_mismatch')
  const expectedCurrency = Object.values(localeConfig).find(config => config.market === market)?.currency
  if (offer.currency !== expectedCurrency) reasons.push('currency_mismatch')
  const expiry = Date.parse(offer.expiresAt)
  if (!Number.isFinite(expiry) || expiry <= now.getTime()) reasons.push('offer_expired')

  if (offer.affiliateUrl) {
    try {
      const url = new URL(offer.affiliateUrl)
      if (url.protocol !== 'https:') reasons.push('non_https')
      if (url.username || url.password) reasons.push('url_credentials')
      if (!merchant.allowedHosts.includes(url.hostname.replace(/^www\./, ''))) reasons.push('host_not_allowed')
    } catch {
      reasons.push('invalid_url')
    }
  }

  return { valid: reasons.length === 0, reasons }
}

export const isFreshPrice = (offer: Offer, now = new Date(), volatile = false) => {
  const maxAge = volatile ? DAY : 7 * DAY
  const age = now.getTime() - Date.parse(offer.verifiedAt)
  return Number.isFinite(age) && age >= 0 && age <= maxAge && Date.parse(offer.expiresAt) > now.getTime()
}
