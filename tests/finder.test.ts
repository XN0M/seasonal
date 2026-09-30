import {describe,it,expect} from 'vitest'
import {readFinderFilters,matchesFinder,matchesCommerceFinder} from '@/lib/finder'
import {products,events} from '@/data/catalog'
import {alternateRoutes} from '@/lib/routes'
import {catalogSchema} from '@/lib/schemas'
import {brands,merchants,offers} from '@/data/catalog'
describe('finder, routes and catalog integrity',()=>{
 it('normalises hostile/unknown URL values',()=>expect(readFinderFilters(new URLSearchParams('recipient=unknown&budget=999&market=XX&event=none'),'fr-fr',events.map(item=>item.id))).toEqual({recipient:'all',category:'all',budget:'all',market:'FR',event:'all'}))
 it('keeps only the chosen event and recipient',()=>{const filters=readFinderFilters(new URLSearchParams('recipient=women&event=black-friday-2026'),'en-gb',events.map(item=>item.id));expect(products.filter(product=>matchesFinder(product,filters)).map(product=>product.id)).toEqual(['fragrance-discovery','silk-accessory','premium-gift-edit'])})
 it('maps localized slugs instead of inventing paths',()=>expect(alternateRoutes('/en-gb/events/holiday-gift-season/')['fr-fr']).toBe('/fr-fr/events/cadeaux-de-noel/'))
 it('rejects broken references and malformed dates',()=>expect(()=>catalogSchema.parse({brands,merchants,events,products,offers:[{...offers[0],productId:'missing',expiresAt:'yesterday'}]})).toThrow())
 it('filters real products using the market offer price rather than the global concept band',()=>{
  const now=new Date('2026-09-30T12:00:00Z')
  const filters=readFinderFilters(new URLSearchParams('budget=under-25&market=FR'),'en-gb',[])
  const card={product:products[0]!,offer:{...offers[0]!,market:'FR' as const,currency:'EUR' as const,price:20}}
  expect(matchesCommerceFinder(card,filters,now)).toBe(true)
  expect(matchesCommerceFinder({...card,offer:{...card.offer,price:25}},filters,now)).toBe(false)
  expect(matchesCommerceFinder({...card,offer:{...card.offer,market:'GB'}},filters,now)).toBe(false)
 })
 it('does not put an unknown or stale price in a budget shortlist',()=>{
  const now=new Date('2026-09-30T12:00:00Z')
  const filters=readFinderFilters(new URLSearchParams('budget=25-50'),'en-gb',[])
  expect(matchesCommerceFinder({product:products[0]!,offer:offers[0]!},filters,now)).toBe(false)
  expect(matchesCommerceFinder({product:products[0]!,offer:{...offers[0]!,price:35,verifiedAt:'2026-01-01T00:00:00Z'}},filters,now)).toBe(false)
 })
})
