import type { Locale, Market, Product } from './types'
import { localeConfig } from './i18n'
import type { CommerceCard } from './commerce'
import { isFreshPrice } from './affiliate'
export interface FinderFilters { recipient: string; category: string; budget: string; event: string; market: Market }
const accepted = { recipient: ['all','women','family','children','teens'], category: ['all','beauty','self-care','accessories','toys','family'], budget: ['all','under-25','25-50','50-100','over-100'] }
export function readFinderFilters(params: URLSearchParams, locale: Locale, events: string[]): FinderFilters {
  const value = (key: keyof typeof accepted) => accepted[key].includes(params.get(key) || '') ? params.get(key)! : 'all'
  const market = params.get('market')
  return { recipient: value('recipient'), category: value('category'), budget: value('budget'), event: events.includes(params.get('event') || '') ? params.get('event')! : 'all', market: market === 'GB' || market === 'DE' || market === 'FR' ? market : localeConfig[locale].market }
}
export function matchesFinder(product: Product, filters: FinderFilters): boolean {
  return (filters.recipient === 'all' || product.recipients.some(value => value === filters.recipient)) &&
    (filters.category === 'all' || product.category === filters.category) &&
    (filters.budget === 'all' || product.budgetBand === filters.budget) &&
    (filters.event === 'all' || product.events.includes(filters.event))
}

// Real recommendations use the selected market's current price, not a global
// editorial band. An unknown/stale price must never imply a budget match.
export function matchesCommerceFinder(card: CommerceCard, filters: FinderFilters, now=new Date()): boolean {
  if(!card.offer || card.offer.market!==filters.market || !Number.isFinite(Date.parse(card.offer.expiresAt)) || Date.parse(card.offer.expiresAt)<=now.getTime()) return false
  if(!matchesFinder(card.product,{...filters,budget:'all'})) return false
  if(filters.budget==='all') return true
  if(!isFreshPrice(card.offer,now)) return false
  const price=card.offer.salePrice ?? card.offer.price
  if(price===undefined) return false
  switch(filters.budget){
    case 'under-25': return price<25
    case '25-50': return price>=25 && price<50
    case '50-100': return price>=50 && price<100
    case 'over-100': return price>=100
    default: return false
  }
}
