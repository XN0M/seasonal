import type { Locale, SeasonalEvent } from '@/lib/types'
export type SeasonalTheme = SeasonalEvent['theme']
export type EffectsPreference = 'auto' | 'on' | 'off'
export type DecorationPlacement = 'header' | 'hero' | 'finder' | 'family' | 'guides' | 'footer' | 'event-info'
export type DecorationMotif = 'tree' | 'gift' | 'star' | 'ribbon' | 'bag'
export interface SeasonalDecorationConfig {
  event: SeasonalTheme
  background: string
  enabled: boolean
  placements: Record<DecorationPlacement, { motif: DecorationMotif; mode: 'loop' | 'once'; priority: number }>
}
const placements = (christmas: boolean): SeasonalDecorationConfig['placements'] => ({
  header: {motif:'ribbon',mode:'once',priority:2},
  hero: {motif:christmas?'tree':'gift',mode:'loop',priority:10},
  finder: {motif:christmas?'gift':'bag',mode:'loop',priority:4},
  family: {motif:christmas?'gift':'bag',mode:'loop',priority:3},
  guides: {motif:'star',mode:'loop',priority:3},
  footer: {motif:'ribbon',mode:'loop',priority:1},
  'event-info': {motif:christmas?'star':'bag',mode:'loop',priority:3},
})
export const decorationThemes = {
  christmas: {event:'christmas',enabled:true,background:'#FAF8F3',placements:placements(true)},
  'black-friday': {event:'black-friday',enabled:true,background:'#F3EEE4',placements:placements(false)},
  halloween: {event:'halloween',enabled:false,background:'#f6f2ea',placements:placements(false)},
  winter: {event:'winter',enabled:false,background:'#f6f2ea',placements:placements(false)},
} satisfies Record<SeasonalTheme,SeasonalDecorationConfig>
export const sceneCopy = {
  'en-gb': {label:'Seasonal effects',on:'Effects on',off:'Effects off',replay:'Replay Santa',reduced:'Static decorations · device preference',override:'Effects enabled by you · device prefers reduced motion',enable:'Enable effects',offNote:'Effects are off. Enable them to replay Santa.'},
  'de-de': {label:'Saisonale Effekte',on:'Effekte an',off:'Effekte aus',replay:'Santa erneut',reduced:'Statische Dekoration · Geräteeinstellung',override:'Von dir aktiviert · Gerät bevorzugt reduzierte Bewegung',enable:'Effekte aktivieren',offNote:'Effekte sind aus. Aktiviere sie, um Santa erneut zu sehen.'},
  'fr-fr': {label:'Effets saisonniers',on:'Effets activés',off:'Effets désactivés',replay:'Revoir le Père Noël',reduced:'Décor fixe · préférence de l’appareil',override:'Effets activés par vous · mouvement réduit sur l’appareil',enable:'Activer les effets',offNote:'Les effets sont désactivés. Activez-les pour revoir le Père Noël.'},
} satisfies Record<Locale,Record<'label'|'on'|'off'|'replay'|'reduced'|'override'|'enable'|'offNote',string>>
export function resolvePreference(saved:string|null,legacy:string|null):EffectsPreference {
  return saved==='auto'||saved==='on'||saved==='off'?saved:legacy==='off'?'off':'auto'
}
export function effectsAllowed(preference:EffectsPreference,reduced:boolean):boolean {
  return preference==='on'||(preference==='auto'&&!reduced)
}
export function animationLimit(mobile:boolean):number{return mobile?2:3}
