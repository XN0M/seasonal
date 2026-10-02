import {brandFinderUrl,findBrands,readBrandFinder,type BrandFilterCandidate,type BrandFinderFilters} from './brand-finder'
import {localeConfig} from './i18n'
import type {Locale,Market} from './types'
import {brandRedirectPath,systemRedirectId} from './redirect-path'

interface FinderConfig {locale:Locale;activeEventId:string;eventIds:string[];priorities:Record<string,string[]>;catalog:Record<Market,BrandFilterCandidate[]>}

// Native controller over server-rendered cards: no React runtime on the critical path.
export function initialiseBrandFinder(){
  document.querySelectorAll<HTMLElement>('[data-brand-finder]').forEach(root=>{
    const encoded=root.dataset.finderConfig
    if(!encoded)return
    const config=JSON.parse(encoded) as FinderConfig
    const finder=root.querySelector<HTMLElement>('.finder'),list=root.querySelector<HTMLElement>('.finder-brand-list')
    if(!finder||!list)return
    const cards=new Map(Array.from(list.querySelectorAll<HTMLElement>('[data-brand-id]')).map(card=>[card.dataset.brandId!,card]))
    const initial:BrandFinderFilters={recipient:'all',category:'all',event:'all',market:localeConfig[config.locale].market}
    let filters=initial
    const render=()=>{
      const results=findBrands(config.catalog[filters.market],filters,config.priorities[filters.event==='all'?config.activeEventId:filters.event]||[],config.locale)
      const keep=new Set(results.map(card=>card.profile.id))
      for(const [id,node]of cards)if(!keep.has(id))node.remove()
      for(const card of results){
        const node=cards.get(card.profile.id)
        if(!node||!card.link)continue
        list.append(node)
        const note=node.querySelector<HTMLElement>('.finder-fulfilment')
        if(note){note.textContent=card.fulfilment.note[config.locale];note.dataset.fulfilment=card.fulfilment.status}
        node.querySelectorAll<HTMLAnchorElement>('[data-affiliate]').forEach(link=>{
          const href=brandRedirectPath(card.profile.id)
          link.href=href
          link.dataset.affiliateUrl=href
          link.dataset.wrapperPath=href
          link.dataset.originalAffiliate=card.link!.affiliateUrl
          link.dataset.affiliate=JSON.stringify({targetType:'brand',brandId:card.profile.id,merchantId:card.link!.merchantId,market:filters.market,locale:config.locale,eventId:filters.event==='all'?config.activeEventId:filters.event,placement:'gift-finder-brand',trackingId:card.link!.trackingId,redirectId:systemRedirectId(card.profile.id)})
        })
      }
      root.querySelectorAll<HTMLButtonElement>('button[data-filter-key]').forEach(button=>{const key=button.dataset.filterKey as 'recipient'|'category';const selected=filters[key]===button.dataset.filterValue;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected))})
      root.querySelectorAll<HTMLSelectElement>('select[data-filter-key]').forEach(select=>{select.value=filters[select.dataset.filterKey as 'event'|'market']})
      const count=root.querySelector('[data-result-count]'),live=root.querySelector('[data-finder-live]'),empty=root.querySelector<HTMLElement>('.finder__empty')
      if(count)count.textContent=String(results.length)
      if(live)live.textContent=live.textContent!.replace(/^\d+/,String(results.length))
      if(empty)empty.hidden=results.length>0
      root.querySelectorAll<HTMLElement>('[data-remove-filter]').forEach(button=>{button.hidden=filters[button.dataset.removeFilter as 'recipient'|'category'|'event']==='all'})
      root.querySelectorAll<HTMLElement>('[data-finder-related-event]').forEach(link=>{link.hidden=link.dataset.finderRelatedEvent===filters.event})
    }
    const choose=(next:BrandFinderFilters)=>{filters=next;history.pushState({},'',brandFinderUrl(new URL(location.href),filters,config.locale));render()}
    const read=()=>{const url=new URL(location.href),state=readBrandFinder(url,config.locale,config.eventIds);filters=state.filters;if(state.migrated){const notice=root.querySelector<HTMLElement>('.finder-migration');if(notice)notice.hidden=false}history.replaceState(history.state,'',brandFinderUrl(url,filters,config.locale));render()}
    root.querySelectorAll<HTMLButtonElement>('button[data-filter-key]').forEach(button=>button.addEventListener('click',()=>choose({...filters,[button.dataset.filterKey!]:button.dataset.filterValue!})))
    root.querySelectorAll<HTMLSelectElement>('select[data-filter-key]').forEach(select=>select.addEventListener('change',()=>choose({...filters,[select.dataset.filterKey!]:select.value})))
    root.querySelectorAll<HTMLButtonElement>('[data-remove-filter]').forEach(button=>button.addEventListener('click',()=>choose({...filters,[button.dataset.removeFilter!]:'all'})))
    root.querySelector<HTMLButtonElement>('[data-finder-reset]')?.addEventListener('click',()=>choose(initial))
    window.addEventListener('popstate',read)
    read()
    root.querySelectorAll<HTMLButtonElement|HTMLSelectElement>('button,select').forEach(control=>control.disabled=false)
    finder.dataset.ready='true'
  })
}
