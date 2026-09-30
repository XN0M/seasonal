import type { Brand, Merchant, Offer, Product, Market } from './types'
import { offerValidation } from './affiliate'

export interface CommerceCard {
  product: Product
  brand?: Brand
  merchant?: Merchant
  offer?: Offer
}

export function resolveCommerceCard(product: Product, market: Market, data: { brands: Brand[]; merchants: Merchant[]; offers: Offer[] }, now = new Date()): CommerceCard {
  const brand = data.brands.find(item => item.id === product.brandId)
  const eligible = data.offers.filter(item => item.productId === product.id && item.market === market)
    .map(offer => ({ offer, merchant: data.merchants.find(item => item.id === offer.merchantId) }))
    .find(({ offer, merchant }) => brand && merchant && offerValidation(offer, product, merchant, now, brand, market).valid)
  return { product, ...(brand ? { brand } : {}), ...(eligible?.merchant ? { merchant: eligible.merchant, offer: eligible.offer } : {}) }
}
