import type { Currency, Locale, Market } from './types'

export const localeConfig: Record<Locale, { languageTag: string; label: string; market: Market; currency: Currency; symbol: string }> = {
  'en-gb': { languageTag: 'en-GB', label: 'United Kingdom · English', market: 'GB', currency: 'GBP', symbol: '£' },
  'de-de': { languageTag: 'de-DE', label: 'Deutschland · Deutsch', market: 'DE', currency: 'EUR', symbol: '€' },
  'fr-fr': { languageTag: 'fr-FR', label: 'France · Français', market: 'FR', currency: 'EUR', symbol: '€' },
}

export const isLocale = (value: string | undefined): value is Locale => Boolean(value && value in localeConfig)

export const ui = {
  'en-gb': {
    currentEvent: 'Current event', gifts: 'Gifts', women: 'Women', family: 'Family & kids', guides: 'Guides', brands: 'Brands', findGift: 'Find a gift',
    disclosure: 'Independent edit. Some future links may earn us a commission at no extra cost to you.',
    exploreEvent: 'Explore the event', finderLabel: 'A quicker way to choose', finderTitle: 'Start with the person, not the product.', finderCopy: 'Tell us who you are shopping for, what they enjoy and your comfortable budget.',
    phases: 'The seasonal rhythm', phaseTitle: 'Shop when it makes sense for you.', editorPicks: "Editor's preview", editorTitle: 'The shape of the edit.', womenTitle: 'For her, without the guesswork.', familyTitle: 'Family gifts, chosen by grown-ups.', budget: 'Shop by budget', upcoming: 'Coming next', guideTitle: 'Useful before it is shoppable.', principles: 'How we choose', trustTitle: 'A calmer way to shop the season.',
    preview: 'Preview listing', pending: 'Partner link coming soon', checked: 'Editorial preview', bestFor: 'Best for', footerLine: 'Seasonal discovery with context, not noise.',
  },
  'de-de': {
    currentEvent: 'Aktuelles Event', gifts: 'Geschenke', women: 'Für sie', family: 'Familie & Kinder', guides: 'Ratgeber', brands: 'Marken', findGift: 'Geschenk finden',
    disclosure: 'Unabhängige Auswahl. Künftige Links können uns eine Provision einbringen – ohne Mehrkosten für Sie.',
    exploreEvent: 'Event entdecken', finderLabel: 'Schneller auswählen', finderTitle: 'Beginnen Sie mit der Person, nicht mit dem Produkt.', finderCopy: 'Für wen suchen Sie, was mag die Person und welches Budget passt?',
    phases: 'Der saisonale Rhythmus', phaseTitle: 'Kaufen Sie dann, wenn es für Sie sinnvoll ist.', editorPicks: 'Redaktionelle Vorschau', editorTitle: 'So wird die Auswahl aussehen.', womenTitle: 'Für sie – ohne Rätselraten.', familyTitle: 'Familiengeschenke, von Erwachsenen ausgewählt.', budget: 'Nach Budget', upcoming: 'Als Nächstes', guideTitle: 'Hilfreich, bevor es kaufbar ist.', principles: 'Unsere Auswahl', trustTitle: 'Ruhiger durch die Geschenksaison.',
    preview: 'Vorschau', pending: 'Partnerlink folgt', checked: 'Redaktionelle Vorschau', bestFor: 'Ideal für', footerLine: 'Saisonale Entdeckungen mit Kontext statt Lärm.',
  },
  'fr-fr': {
    currentEvent: 'Événement en cours', gifts: 'Cadeaux', women: 'Pour elle', family: 'Famille & enfants', guides: 'Guides', brands: 'Marques', findGift: 'Trouver un cadeau',
    disclosure: 'Sélection indépendante. Certains futurs liens pourront nous rémunérer, sans coût supplémentaire pour vous.',
    exploreEvent: "Explorer l'événement", finderLabel: 'Choisir plus vite', finderTitle: 'Commencez par la personne, pas par le produit.', finderCopy: 'Pour qui cherchez-vous, quels sont ses goûts et quel budget vous convient ?',
    phases: 'Le rythme de la saison', phaseTitle: 'Achetez au moment qui vous convient.', editorPicks: 'Aperçu éditorial', editorTitle: 'La sélection prend forme.', womenTitle: 'Pour elle, sans choisir au hasard.', familyTitle: 'Des cadeaux famille choisis par des adultes.', budget: 'Par budget', upcoming: 'À venir', guideTitle: "Utile avant même l'achat.", principles: 'Notre sélection', trustTitle: 'Une façon plus sereine de vivre la saison.',
    preview: 'Aperçu', pending: 'Lien partenaire à venir', checked: 'Aperçu éditorial', bestFor: 'Idéal pour', footerLine: 'Une sélection saisonnière avec du contexte, sans bruit.',
  },
} satisfies Record<Locale, Record<string, string>>

export const localPath = (locale: Locale, path = '') => `/${locale}/${path.replace(/^\//, '')}`

export const formatMoney = (amount: number, locale: Locale, currency: Currency) =>
  new Intl.NumberFormat(localeConfig[locale].languageTag, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

export const formatDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(localeConfig[locale].languageTag, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))
