import { describe, expect, it } from 'vitest'
import { activeEvent, events } from '@/data/catalog'
import { resolveEventPhase, eventPhaseLabels } from '@/lib/events'

describe('event phase resolver', () => {
  const christmas=events.find(event=>event.id==='holiday-2026')!
  it('uses inspiration before an event opens', () => expect(resolveEventPhase(christmas, 'GB', new Date('2026-08-01'))).toBe('inspiration'))
  it('resolves the configured deal window', () => expect(resolveEventPhase(christmas, 'GB', new Date('2026-12-12'))).toBe('deal-window'))
  it('moves to post-event after the campaign', () => expect(resolveEventPhase(christmas, 'GB', new Date('2027-03-01'))).toBe('post-event'))
  it('selects Halloween explicitly with local dates and honest preparation labels',()=>{
    expect(activeEvent.id).toBe('halloween-2026')
    for(const market of ['GB','DE','FR'] as const){
      expect(new Intl.DateTimeFormat('en-GB',{timeZone:activeEvent.datesByMarket[market].timezone,day:'numeric',month:'numeric',year:'numeric'}).format(new Date(activeEvent.datesByMarket[market].eventAt))).toBe('31/10/2026')
      expect(resolveEventPhase(activeEvent,market,new Date('2026-10-01T12:00:00Z'))).toBe('early-shopping')
      expect(resolveEventPhase(activeEvent,market,new Date('2026-10-27T12:00:00Z'))).toBe('last-chance')
      expect(resolveEventPhase(activeEvent,market,new Date('2026-11-01T12:00:00Z'))).toBe('post-event')
    }
    expect(eventPhaseLabels(activeEvent)['deal-window']['en-gb']).toBe('Finishing touches')
    expect(eventPhaseLabels(christmas)['deal-window']['en-gb']).toBe('Shop offers')
  })
})
