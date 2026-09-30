import type { CampaignPhase, EventPhase, Market, SeasonalEvent } from './types'

export const resolveEventPhase = (event: SeasonalEvent, market: Market, now = new Date()): EventPhase => {
  const phases = event.phasesByMarket[market]
  const active = phases.find((phase) => now >= new Date(phase.startsAt) && now < new Date(phase.endsAt))
  if (active) return active.id
  return now < new Date(phases[0]?.startsAt || event.datesByMarket[market].startsAt) ? 'inspiration' : 'post-event'
}

export const phaseProgress = (phases: CampaignPhase[], current: EventPhase) => {
  const index = phases.findIndex((phase) => phase.id === current)
  return index < 0 ? 0 : index
}

export const phaseLabels: Record<EventPhase, Record<'en-gb' | 'de-de' | 'fr-fr', string>> = {
  inspiration: { 'en-gb': 'Plan early', 'de-de': 'Früh planen', 'fr-fr': 'Anticiper' },
  'early-shopping': { 'en-gb': 'Early edit', 'de-de': 'Frühe Auswahl', 'fr-fr': 'Sélection en avance' },
  'deal-window': { 'en-gb': 'Shop offers', 'de-de': 'Angebote', 'fr-fr': 'Profiter des offres' },
  'last-chance': { 'en-gb': 'Last delivery', 'de-de': 'Letzte Lieferung', 'fr-fr': 'Dernières livraisons' },
  'post-event': { 'en-gb': 'After the event', 'de-de': 'Nach dem Event', 'fr-fr': "Après l'événement" },
}
