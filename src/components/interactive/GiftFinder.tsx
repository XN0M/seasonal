import { useEffect, useMemo, useState } from 'react'
import type { Locale, Market, SeasonalEvent } from '@/lib/types'
import type { CommerceCard } from '@/lib/commerce'
import { localeConfig } from '@/lib/i18n'
import { localPath } from '@/lib/i18n'
import { halloweenCopy } from '@/lib/seasonal/copy'
import { matchesFinder, matchesCommerceFinder, readFinderFilters, type FinderFilters } from '@/lib/finder'

const copy = {
  'en-gb': { who:'Who is it for?', interest:'What do they enjoy?', budget:'Budget', event:'Event', market:'Retail market', result:'Your considered shortlist', none:'No verified offers match yet. Try a broader budget or another interest. We only show retailers available in your selected market.', reset:'Reset filters', all:'Any', concepts:'Preview gift concepts', preview:'These unbranded ideas demonstrate the finder. They are not purchasable listings.', women:'Women', family:'Family', children:'Children', teens:'Teens', beauty:'Beauty', care:'Self-care', accessories:'Accessories', play:'Play', together:'Together time' },
  'de-de': { who:'Für wen ist es?', interest:'Was gefällt der Person?', budget:'Budget', event:'Anlass', market:'Händlermarkt', result:'Ihre persönliche Auswahl', none:'Noch keine geprüften Angebote. Wählen Sie ein anderes Budget oder Interesse. Wir zeigen nur Händler für Ihren Markt.', reset:'Filter zurücksetzen', all:'Alle', concepts:'Geschenkideen als Vorschau', preview:'Diese markenfreien Ideen zeigen die Funktion. Sie sind nicht kaufbar.', women:'Für sie', family:'Familie', children:'Kinder', teens:'Teenager', beauty:'Beauty', care:'Self-Care', accessories:'Accessoires', play:'Spielen', together:'Gemeinsame Zeit' },
  'fr-fr': { who:'Pour qui ?', interest:'Quels sont ses goûts ?', budget:'Budget', event:'Événement', market:'Marché', result:'Votre sélection réfléchie', none:'Aucune offre vérifiée. Essayez un autre budget ou intérêt. Nous affichons uniquement les marchands disponibles sur votre marché.', reset:'Réinitialiser', all:'Tous', concepts:'Idées cadeaux en aperçu', preview:'Ces idées sans marque illustrent le fonctionnement. Elles ne sont pas des offres à acheter.', women:'Pour elle', family:'Famille', children:'Enfants', teens:'Adolescents', beauty:'Beauté', care:'Bien-être', accessories:'Accessoires', play:'Jeux', together:'Moments ensemble' },
} as const
interface Props { catalog: Record<Market, CommerceCard[]>; concepts: CommerceCard[]; events: SeasonalEvent[]; locale: Locale }

export default function GiftFinder({ catalog, concepts, events, locale }: Props) {
  const t = copy[locale]
  const initial: FinderFilters = { recipient:'all', category:'all', budget:'all', event:'all', market:localeConfig[locale].market }
  const [ready, setReady] = useState(false)
  const [filters, setFilters] = useState(initial)
  const [feedback, setFeedback] = useState(0)
  useEffect(() => {
    const read = () => setFilters(readFinderFilters(new URLSearchParams(location.search), locale, events.map(item => item.id)))
    read(); setReady(true)
    window.addEventListener('popstate', read)
    return () => window.removeEventListener('popstate', read)
  }, [locale, events])
  useEffect(() => {
    if (!ready) return
    const params = new URLSearchParams(location.search)
    for (const [key,value] of Object.entries(filters)) {
      if (value === 'all' || (key === 'market' && value === localeConfig[locale].market)) params.delete(key)
      else params.set(key,value)
    }
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`)
  }, [filters, locale, ready])
  const results = useMemo(() => catalog[filters.market].filter(card => matchesCommerceFinder(card, filters)), [catalog, filters])
  const preview = concepts.filter(card => matchesFinder(card.product, filters))
  const update = <K extends keyof FinderFilters>(key:K, value:FinderFilters[K]) => {
    setFilters(current => ({ ...current, [key]:value }))
    setFeedback(current => current + 1)
  }
  const choices = (key:'recipient'|'category'|'budget', entries:Array<[string,string]>) => entries.map(([label,value]) => <button key={value} type="button" className={`finder-chip ${filters[key] === value ? 'is-active' : ''}`} aria-pressed={filters[key] === value} disabled={!ready} onClick={() => update(key,value)}>{label}</button>)
  const currency = filters.market === 'GB' ? '£' : '€'
  const list = (cards:CommerceCard[]) => <div className="finder__list">{cards.map(({product,offer,merchant}) => <article key={product.id}><img src={product.image.replace('.webp','-320.webp')} width="90" height="105" loading="lazy" alt={product.imageAlt[locale]}/><div><p>{product.category}</p><h3>{product.name[locale]}</h3><span>{product.bestFor[locale]}</span>{offer?.affiliateUrl && <a href={offer.affiliateUrl} rel="sponsored nofollow" data-expires-at={offer.expiresAt} data-affiliate={JSON.stringify({productId:product.id,brandId:product.brandId,merchantId:offer.merchantId,market:filters.market,locale,eventId:filters.event,placement:'gift-finder',trackingId:offer.trackingId})}>{merchant?.name} ↗</a>}</div></article>)}</div>
  return <div className="finder" data-ready={ready}>
    <div className="finder__filters">
      <fieldset><legend>01 · {t.who}</legend><div>{choices('recipient',[[t.all,'all'],[t.women,'women'],[t.family,'family'],[t.children,'children'],[t.teens,'teens']])}</div></fieldset>
      <fieldset><legend>02 · {t.interest}</legend><div>{choices('category',[[t.all,'all'],[t.beauty,'beauty'],[t.care,'self-care'],[t.accessories,'accessories'],[t.play,'toys'],[t.together,'family']])}</div></fieldset>
      <fieldset><legend>03 · {t.budget}</legend><div>{choices('budget',[[t.all,'all'],[`${currency} 0–25`,'under-25'],[`${currency} 25–50`,'25-50'],[`${currency} 50–100`,'50-100'],[`${currency} 100+`,'over-100']])}</div></fieldset>
      <label className="finder-select">04 · {t.event}<select value={filters.event} disabled={!ready} onChange={event => update('event',event.target.value)}><option value="all">{t.all}</option>{events.map(event => <option key={event.id} value={event.id}>{event.name[locale]}</option>)}</select></label>
      <label className="finder-select">05 · {t.market}<select value={filters.market} disabled={!ready} onChange={event => update('market',event.target.value as Market)}><option value="GB">United Kingdom · GBP</option><option value="DE">Deutschland · EUR</option><option value="FR">France · EUR</option></select></label>
    </div>
    <div className="finder__result" aria-live="polite" aria-busy={!ready}>
      <div className="finder__result-head"><div><span key={feedback} className={feedback ? 'finder__feedback' : undefined}>{String(results.length).padStart(2,'0')}</span><h2>{t.result}</h2></div><button type="button" disabled={!ready} onClick={() => { setFilters(initial); setFeedback(current => current + 1) }}>{t.reset}</button></div>
      {results.length ? <><p className="muted">{locale==='de-de'?'Affiliate-Links: Wir können eine Provision erhalten.':locale==='fr-fr'?'Liens affiliés : nous pouvons recevoir une commission.':'Affiliate links: we may earn a commission.'}</p>{list(results)}</> : filters.event === 'halloween-2026' ? <div className="finder__empty"><p>{halloweenCopy[locale].empty}</p><nav className="empty-event-links" aria-label={halloweenCopy[locale].other}>{events.filter(event=>event.id!==filters.event).map(event=><a className="text-link" key={event.id} href={localPath(locale,`events/${event.slug[locale]}/`)}>{event.name[locale]} →</a>)}</nav></div> : <p className="finder__empty">{t.none}</p>}
      {preview.length > 0 && <details className="finder-concepts" open><summary>{t.concepts} · {preview.length}</summary><p>{t.preview}</p>{list(preview)}</details>}
    </div>
  </div>
}
