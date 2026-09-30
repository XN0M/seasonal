import { describe, expect, it } from 'vitest'
import { activeEvent } from '@/data/catalog'
import { resolveEventPhase } from '@/lib/events'

describe('event phase resolver', () => {
  it('uses inspiration before an event opens', () => expect(resolveEventPhase(activeEvent, 'GB', new Date('2026-08-01'))).toBe('inspiration'))
  it('resolves the configured deal window', () => expect(resolveEventPhase(activeEvent, 'GB', new Date('2026-12-12'))).toBe('deal-window'))
  it('moves to post-event after the campaign', () => expect(resolveEventPhase(activeEvent, 'GB', new Date('2027-03-01'))).toBe('post-event'))
})
