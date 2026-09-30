import { events } from '@/data/catalog'
import { localeCodes, type Locale } from './types'

export function alternateRoutes(pathname: string): Record<Locale, string> {
  const parts = pathname.split('/').filter(Boolean)
  const from = parts[0] as Locale
  const rest = parts.slice(1)
  const event = rest[0] === 'events' || rest[0] === 'campaigns' ? events.find(item => item.slug[from] === rest[1]) : undefined
  return Object.fromEntries(localeCodes.map(locale => [locale, event ? `/${locale}/${rest[0]}/${event.slug[locale]}/` : `/${locale}/${rest.length ? `${rest.join('/')}/` : ''}`])) as Record<Locale, string>
}
