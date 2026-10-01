import {describe,it,expect} from 'vitest'
import {brandRegistry} from '@/data/brands'
import {brandCards} from '@/lib/brands'
import {readBrandFinder,brandFinderUrl,findBrands} from '@/lib/brand-finder'
const ids=['halloween-2026','black-friday-2026','holiday-2026']
describe('brand finder contract',()=>{
  it('migrates legacy budget/categories while preserving attribution and hash',()=>{
    for(const [old,next]of [['accessories','fashion'],['toys','creative'],['family','home']]){
      const url=new URL(`https://preview.example/en-gb/gift-finder/?budget=50-100&category=${old}&recipient=teens&market=FR&utm_source=facebook#results`)
      const state=readBrandFinder(url,'en-gb',ids),result=brandFinderUrl(url,state.filters,'en-gb')
      expect(state.migrated).toBe(true);expect(state.filters.category).toBe(next);expect(result).not.toContain('budget=');expect(result).toContain('utm_source=facebook');expect(result).toContain('market=FR');expect(result.endsWith('#results')).toBe(true)
    }
  })
  it('filters exact recipient and event without silently relaxing empty selections',()=>{
    const cards=brandCards(brandRegistry,'FR','halloween-2026','fr-fr'),filters=readBrandFinder(new URL('https://preview.example/?recipient=children&event=halloween-2026'),'fr-fr',ids).filters
    expect(findBrands(cards,filters,brandRegistry.eventPriority[filters.event]!,'fr-fr')).toEqual([])
    expect(findBrands(cards,{...filters,event:'all'},[],'fr-fr').map(card=>card.profile.id)).toEqual(['toybox'])
  })
  it('has all ten links without a budget, and unknown shipping never hides them',()=>{
    for(const market of ['GB','DE','FR'] as const){const cards=brandCards(brandRegistry,market,'halloween-2026','en-gb');expect(findBrands(cards,{recipient:'all',category:'all',event:'all',market},[],'en-gb')).toHaveLength(10)}
  })
  it('normalises unknown values and excludes paused links',()=>{
    const filters=readBrandFinder(new URL('https://preview.example/?recipient=bad&category=bad&market=US&event=bad'),'de-de',ids).filters
    expect(filters).toEqual({recipient:'all',category:'all',event:'all',market:'DE'})
    const registry={...brandRegistry,links:brandRegistry.links.map(link=>({...link,status:'paused' as const}))}
    expect(findBrands(brandCards(registry,'DE','holiday-2026','de-de'),filters,[],'de-de')).toHaveLength(0)
  })
})
