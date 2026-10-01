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

const halloweenLabels: typeof phaseLabels = {
  inspiration: {'en-gb':'Gather ideas','de-de':'Ideen sammeln','fr-fr':'Trouver des idées'},
  'early-shopping': {'en-gb':'Plan the evening','de-de':'Den Abend planen','fr-fr':'Préparer la soirée'},
  'deal-window': {'en-gb':'Finishing touches','de-de':'Letzte Details','fr-fr':'Les dernières touches'},
  'last-chance': {'en-gb':'Ready for Halloween','de-de':'Bereit für Halloween','fr-fr':'Prêts pour Halloween'},
  'post-event': {'en-gb':'After Halloween','de-de':'Nach Halloween','fr-fr':'Après Halloween'},
}
export const eventPhaseLabels = (event: SeasonalEvent) => event.theme === 'halloween' ? halloweenLabels : phaseLabels
