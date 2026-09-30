import type { Brand, CampaignPhase, Merchant, Offer, Product, SeasonalEvent } from '@/lib/types'
import {catalogSchema} from '@/lib/schemas'

const phases = (eventAt: string): CampaignPhase[] => {
  const event = new Date(eventAt)
  const iso = (offset: number) => new Date(event.getTime() + offset * 86_400_000).toISOString()
  return [
    { id: 'inspiration', startsAt: iso(-70), endsAt: iso(-42) },
    { id: 'early-shopping', startsAt: iso(-42), endsAt: iso(-14) },
    { id: 'deal-window', startsAt: iso(-14), endsAt: iso(-4) },
    { id: 'last-chance', startsAt: iso(-4), endsAt: iso(1) },
    { id: 'post-event', startsAt: iso(1), endsAt: iso(22) },
  ]
}

export const events: SeasonalEvent[] = [
  {
    id: 'holiday-2026',
    slug: { 'en-gb': 'holiday-gift-season', 'de-de': 'weihnachtsgeschenke', 'fr-fr': 'cadeaux-de-noel' },
    name: { 'en-gb': 'Holiday Gift Season', 'de-de': 'Weihnachtszeit', 'fr-fr': 'Saison des cadeaux' },
    eyebrow: { 'en-gb': 'The winter gift edit · 2026', 'de-de': 'Die Winterauswahl · 2026', 'fr-fr': "La sélection d'hiver · 2026" },
    headline: { 'en-gb': 'Find the gift that feels considered.', 'de-de': 'Finden Sie ein Geschenk mit Gefühl.', 'fr-fr': 'Trouvez le cadeau qui a vraiment du sens.' },
    description: {
      'en-gb': 'A clear, grown-up edit for women and families—organised by person, interest and budget.',
      'de-de': 'Eine klare, erwachsene Auswahl für Frauen und Familien – nach Person, Interesse und Budget.',
      'fr-fr': 'Une sélection claire pour les femmes et les familles, classée par personne, intérêt et budget.',
    },
    datesByMarket: {
      GB: { startsAt: '2026-10-15T00:00:00Z', eventAt: '2026-12-25T00:00:00Z', endsAt: '2027-01-15T23:59:59Z', timezone: 'Europe/London' },
      DE: { startsAt: '2026-10-15T00:00:00Z', eventAt: '2026-12-24T00:00:00Z', endsAt: '2027-01-10T23:59:59Z', timezone: 'Europe/Berlin' },
      FR: { startsAt: '2026-10-15T00:00:00Z', eventAt: '2026-12-25T00:00:00Z', endsAt: '2027-01-10T23:59:59Z', timezone: 'Europe/Paris' },
    },
    phasesByMarket: { GB: phases('2026-12-25T00:00:00Z'), DE: phases('2026-12-24T00:00:00Z'), FR: phases('2026-12-25T00:00:00Z') },
    theme: 'christmas', image: '/images/holiday-hero.webp', status: 'preview',
  },
  {
    id: 'black-friday-2026',
    slug: { 'en-gb': 'black-friday', 'de-de': 'black-friday', 'fr-fr': 'black-friday' },
    name: { 'en-gb': 'Black Friday', 'de-de': 'Black Friday', 'fr-fr': 'Black Friday' },
    eyebrow: { 'en-gb': 'A more useful deal edit', 'de-de': 'Eine bessere Angebotsauswahl', 'fr-fr': "Une sélection d'offres plus utile" },
    headline: { 'en-gb': 'A good deal still has to be a good gift.', 'de-de': 'Ein gutes Angebot muss auch ein gutes Geschenk sein.', 'fr-fr': 'Une bonne offre doit rester un bon cadeau.' },
    description: {
      'en-gb': 'Verified offers, useful context and no manufactured urgency.',
      'de-de': 'Geprüfte Angebote, nützlicher Kontext und kein künstlicher Zeitdruck.',
      'fr-fr': "Des offres vérifiées, du contexte et aucune urgence artificielle.",
    },
    datesByMarket: {
      GB: { startsAt: '2026-10-10T00:00:00Z', eventAt: '2026-11-27T00:00:00Z', endsAt: '2026-12-02T23:59:59Z', timezone: 'Europe/London' },
      DE: { startsAt: '2026-10-10T00:00:00Z', eventAt: '2026-11-27T00:00:00Z', endsAt: '2026-12-02T23:59:59Z', timezone: 'Europe/Berlin' },
      FR: { startsAt: '2026-10-10T00:00:00Z', eventAt: '2026-11-27T00:00:00Z', endsAt: '2026-12-02T23:59:59Z', timezone: 'Europe/Paris' },
    },
    phasesByMarket: { GB: phases('2026-11-27T00:00:00Z'), DE: phases('2026-11-27T00:00:00Z'), FR: phases('2026-11-27T00:00:00Z') },
    theme: 'black-friday', image: '/images/black-friday.webp', status: 'preview',
  },
]

export const brands: Brand[] = [
  { id: 'editorial-preview', name: 'Partner selection pending', status: 'preview' },
]

export const merchants: Merchant[] = [
  { id: 'preview-merchant', name: 'Retail partner pending', markets: ['GB', 'DE', 'FR'], allowedHosts: [], status: 'preview' },
]

const text = (en: string, de: string, fr: string) => ({ 'en-gb': en, 'de-de': de, 'fr-fr': fr })

export const products: Product[] = [
  {
    id: 'fragrance-discovery', brandId: 'editorial-preview', name: text('Fragrance discovery set', 'Duft-Entdeckerset', 'Coffret découverte parfum'),
    why: text('A lower-risk way to gift scent without choosing one full-size bottle.', 'Eine sichere Art, Duft zu verschenken, ohne einen großen Flakon zu wählen.', "Une manière plus simple d'offrir un parfum sans imposer un grand flacon."),
    bestFor: text('The curious fragrance wearer', 'Neugierige Duftfans', 'Les personnes curieuses de parfums'),
    category: 'beauty', recipients: ['women', 'teens'], budgetBand: '25-50', events: ['holiday-2026', 'black-friday-2026'], image: '/images/gifts-for-her.webp',
    imageAlt: text('Unlabelled fragrance and silk accessories in warm light', 'Unbeschrifteter Duft und Seidenaccessoires im warmen Licht', 'Parfum sans étiquette et accessoires en soie dans une lumière chaude'), evidenceUrls: [], status: 'preview',
  },
  {
    id: 'quiet-self-care', brandId: 'editorial-preview', name: text('Quiet self-care edit', 'Ruhiges Self-Care-Set', 'Sélection bien-être apaisante'),
    why: text('A useful mix of small, everyday comforts rather than decorative filler.', 'Alltagstaugliche Kleinigkeiten statt rein dekorativer Füllprodukte.', "Des essentiels quotidiens utiles plutôt qu'un simple remplissage décoratif."),
    bestFor: text('Someone who values slower evenings', 'Menschen, die ruhige Abende schätzen', 'Celles et ceux qui aiment les soirées paisibles'),
    category: 'self-care', recipients: ['women'], budgetBand: '50-100', events: ['holiday-2026'], image: '/images/gifts-for-her.webp',
    imageAlt: text('Editorial self-care accessories on warm paper', 'Self-Care-Accessoires auf warmem Papier', 'Accessoires bien-être sur papier chaud'), evidenceUrls: [], status: 'preview',
  },
  {
    id: 'silk-accessory', brandId: 'editorial-preview', name: text('Silk accessory set', 'Seiden-Accessoire-Set', "Coffret d'accessoires en soie"),
    why: text('Giftable, compact and easy to match to an existing routine.', 'Geschenktauglich, kompakt und leicht in eine Routine zu integrieren.', "Un cadeau compact, facile à intégrer dans une routine existante."),
    bestFor: text('Beauty and style minimalists', 'Beauty- und Stilminimalistinnen', 'Les adeptes de beauté et de style minimalistes'),
    category: 'accessories', recipients: ['women', 'teens'], budgetBand: '25-50', events: ['holiday-2026', 'black-friday-2026'], image: '/images/holiday-hero.webp',
    imageAlt: text('Silk ribbon and gift objects in an ivory studio', 'Seidenband und Geschenkobjekte in einem hellen Studio', "Ruban de soie et objets cadeaux dans un studio ivoire"), evidenceUrls: [], status: 'preview',
  },
  {
    id: 'creative-building', brandId: 'editorial-preview', name: text('Creative building set', 'Kreatives Bauset', 'Jeu de construction créatif'),
    why: text('Open-ended play that can be shared across the family.', 'Offenes Spiel, das die Familie gemeinsam erleben kann.', 'Un jeu ouvert à partager en famille.'),
    bestFor: text('Adults choosing for children aged 4+', 'Erwachsene, die für Kinder ab 4 wählen', 'Adultes choisissant pour des enfants de 4 ans et plus'),
    category: 'toys', recipients: ['family', 'children'], budgetBand: '25-50', events: ['holiday-2026', 'black-friday-2026'], image: '/images/family-gifts.webp',
    imageAlt: text('Parent and child arranging wooden building pieces', 'Elternteil und Kind mit Holzbausteinen', 'Parent et enfant jouant avec des pièces en bois'), evidenceUrls: [], status: 'preview',
  },
  {
    id: 'family-game', brandId: 'editorial-preview', name: text('Family game night edit', 'Familien-Spieleabend', 'Sélection soirée jeux en famille'),
    why: text('A screen-light shared activity with clear age guidance.', 'Eine gemeinsame Aktivität mit wenig Bildschirm und klarer Altersangabe.', "Une activité partagée, loin des écrans, avec un âge clairement indiqué."),
    bestFor: text('Families gathering over the holidays', 'Familien, die über die Feiertage zusammenkommen', 'Les familles réunies pendant les fêtes'),
    category: 'family', recipients: ['family', 'children', 'teens'], budgetBand: 'under-25', events: ['holiday-2026'], image: '/images/family-gifts.webp',
    imageAlt: text('Warm family gift scene with wooden play pieces', 'Warme Familienszene mit Holzspielzeug', 'Scène familiale chaleureuse avec pièces de jeu en bois'), evidenceUrls: [], status: 'preview',
  },
  {
    id: 'premium-gift-edit', brandId: 'editorial-preview', name: text('Premium gift edit', 'Premium-Geschenkauswahl', 'Sélection cadeau premium'),
    why: text('A considered higher-budget option, selected for use beyond the season.', 'Eine hochwertige Wahl, die auch nach der Saison nützlich bleibt.', 'Une option plus précieuse pensée pour durer au-delà des fêtes.'),
    bestFor: text('A main gift with long-term use', 'Ein Hauptgeschenk mit langfristigem Nutzen', 'Un cadeau principal conçu pour durer'),
    category: 'accessories', recipients: ['women', 'family'], budgetBand: 'over-100', events: ['black-friday-2026'], image: '/images/black-friday.webp',
    imageAlt: text('Premium unbranded gifts on a black and gold set', 'Hochwertige unbeschriftete Geschenke auf Schwarz und Gold', 'Cadeaux premium sans marque sur décor noir et or'), evidenceUrls: [], status: 'preview',
  },
]

export const offers: Offer[] = products.map((product, index) => ({
  id: `preview-${index + 1}`,
  productId: product.id,
  merchantId: 'preview-merchant',
  market: index % 3 === 0 ? 'GB' : index % 3 === 1 ? 'DE' : 'FR',
  currency: index % 3 === 0 ? 'GBP' : 'EUR',
  affiliateUrl: null,
  trackingId: null,
  verifiedAt: '2026-09-30T00:00:00Z',
  expiresAt: '2026-12-31T23:59:59Z',
  status: 'preview',
}))

export const activeEvent: SeasonalEvent = events[0]!

export const getProductOffer = (productId: string, market: 'GB' | 'DE' | 'FR') =>
  offers.find((offer) => offer.productId === productId && offer.market === market)

export const budgets = [
  { id: 'under-25', label: { 'en-gb': 'Under £25', 'de-de': 'Unter 25 €', 'fr-fr': 'Moins de 25 €' } },
  { id: '25-50', label: { 'en-gb': '£25–£50', 'de-de': '25–50 €', 'fr-fr': '25–50 €' } },
  { id: '50-100', label: { 'en-gb': '£50–£100', 'de-de': '50–100 €', 'fr-fr': '50–100 €' } },
  { id: 'over-100', label: { 'en-gb': '£100+', 'de-de': '100 €+', 'fr-fr': '100 €+' } },
] as const

// Invalid data or broken references fail the build with a Zod path to the record.
catalogSchema.parse({brands,merchants,products,offers,events})
