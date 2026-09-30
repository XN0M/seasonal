import { describe, expect, it } from 'vitest'
import { isFreshPrice, offerValidation } from '@/lib/affiliate'
import type { Merchant, Offer, Product } from '@/lib/types'

const product: Product = {
  id: 'p1', brandId: 'b1', name: { 'en-gb': 'Product', 'de-de': 'Produkt', 'fr-fr': 'Produit' }, why: { 'en-gb': 'Useful', 'de-de': 'Nützlich', 'fr-fr': 'Utile' }, bestFor: { 'en-gb': 'Adults', 'de-de': 'Erwachsene', 'fr-fr': 'Adultes' }, category: 'beauty', recipients: ['women'], budgetBand: '25-50', events: ['holiday'], image: '/x.webp', imageAlt: { 'en-gb': 'Product', 'de-de': 'Produkt', 'fr-fr': 'Produit' }, evidenceUrls: [], status: 'active',
}
const merchant: Merchant = { id: 'm1', name: 'Merchant', markets: ['GB'], allowedHosts: ['merchant.example'], status: 'active' }
const offer: Offer = { id: 'o1', productId: 'p1', merchantId: 'm1', market: 'GB', currency: 'GBP', affiliateUrl: 'https://merchant.example/item?ref=abc', trackingId: 'abc', verifiedAt: '2026-09-30T00:00:00Z', expiresAt: '2026-12-31T00:00:00Z', status: 'active' }

describe('offerValidation', () => {
  it('accepts a valid allowlisted HTTPS offer', () => expect(offerValidation(offer, product, merchant, new Date('2026-10-01')).valid).toBe(true))
  it('rejects expired offers', () => expect(offerValidation({ ...offer, expiresAt: '2026-01-01' }, product, merchant, new Date('2026-10-01')).reasons).toContain('offer_expired'))
  it('rejects unknown hosts and missing tracking', () => {
    const result = offerValidation({ ...offer, affiliateUrl: 'https://wrong.example/item', trackingId: null }, product, merchant, new Date('2026-10-01'))
    expect(result.reasons).toEqual(expect.arrayContaining(['host_not_allowed', 'missing_tracking']))
  })
  it('rejects mismatched currency, identities and selected market',()=>{
    expect(offerValidation({...offer,currency:'GBP',productId:'wrong'},product,merchant,new Date('2026-10-01'),undefined,'DE').reasons).toEqual(expect.arrayContaining(['currency_mismatch','record_mismatch','market_mismatch']))
  })
  it('rejects credentials, exact expiry and inactive brands',()=>{
    expect(offerValidation({...offer,affiliateUrl:'https://user:pass@merchant.example/item'},product,merchant,new Date('2026-12-31'),{id:'b1',name:'Brand',status:'paused'}).reasons).toEqual(expect.arrayContaining(['url_credentials','offer_expired','brand_inactive']))
  })
  it('does not consider future or stale verification dates fresh',()=>{
    expect(isFreshPrice(offer,new Date('2026-09-29'))).toBe(false)
    expect(isFreshPrice(offer,new Date('2026-10-10'))).toBe(false)
  })
})
