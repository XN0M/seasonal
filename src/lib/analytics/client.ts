import type { AffiliateClickPayload } from '../types'
import { readAffiliateClick } from './affiliate-click'

type Pixel = ((...args:unknown[])=>void)&{queue:unknown[][];callMethod?:(...args:unknown[])=>void;loaded:boolean;version:string}
type TrackingWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; fbq?: Pixel; _fbq?:Pixel }
const trackingWindow = window as TrackingWindow
const gaId = import.meta.env.PUBLIC_GA_ID || ''
const adsId = import.meta.env.PUBLIC_GOOGLE_ADS_ID || ''
const pixelId = import.meta.env.PUBLIC_META_PIXEL_ID || ''
export const trackingConfigured = /^G-[A-Z0-9]+$/.test(gaId) || /^AW-\d+$/.test(adsId) || /^\d+$/.test(pixelId)
export function consentAccepted(): boolean {
  try { return localStorage.getItem('seasonal-edit-consent') === 'accepted' } catch { return false }
}
function loadScript(src: string, id: string, loaded?: () => void) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id; script.src = src; script.async = true
  if (loaded) script.onload = loaded
  document.head.append(script)
}
function startAdvertising() {
  if (!consentAccepted()) return
  const googleIds = [gaId,adsId].filter(value => /^(G-[A-Z0-9]+|AW-\d+)$/.test(value))
  if (googleIds.length && !trackingWindow.gtag) {
    trackingWindow.dataLayer = []
    trackingWindow.gtag = function (...args: unknown[]) { trackingWindow.dataLayer?.push(args) }
    trackingWindow.gtag('consent','default',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'denied',ad_personalization:'denied'})
    trackingWindow.gtag('js',new Date())
    for (const id of googleIds) trackingWindow.gtag('config',id,{allow_google_signals:false,allow_ad_personalization_signals:false})
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleIds[0]!)}`,'google-measurement')
  }
  if (/^\d+$/.test(pixelId) && !trackingWindow.fbq) {
    const queue: unknown[][] = []
    const pixel:Pixel = Object.assign((...args: unknown[]) => { if(pixel.callMethod)pixel.callMethod(...args);else queue.push(args) },{queue,loaded:true,version:'2.0'})
    trackingWindow.fbq = pixel
    trackingWindow._fbq = pixel
    loadScript('https://connect.facebook.net/en_US/fbevents.js','meta-measurement',() => {
      trackingWindow.fbq?.('init',pixelId)
      trackingWindow.fbq?.('track','PageView')
    })
  }
}
export function initialiseAnalytics() {
  startAdvertising()
  window.addEventListener('consent_updated',startAdvertising)
  document.querySelector('[data-privacy-reset]')?.addEventListener('click',() => window.dispatchEvent(new Event('privacy_preferences')))
  document.addEventListener('click',event => {
    const element = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-affiliate]') : null
    if (!element || event.defaultPrevented) return
    const detail = readAffiliateClick(element.dataset.affiliate || '', element.href, element.dataset.expiresAt,Date.now(),element.dataset.wrapperPath&&element.dataset.originalAffiliate?{origin:location.origin,path:element.dataset.wrapperPath,affiliateUrl:element.dataset.originalAffiliate}:undefined)
    if (!detail || !element.rel.split(/\s+/).includes('sponsored') || (element.dataset.affiliateUrl && element.getAttribute('href') !== element.dataset.affiliateUrl)) { event.preventDefault(); return }
    window.dispatchEvent(new CustomEvent<AffiliateClickPayload>('affiliate_click',{detail}))
    if (consentAccepted()) {
      trackingWindow.gtag?.('event','affiliate_click',{...detail,transport_type:'beacon'})
      trackingWindow.fbq?.('trackCustom','affiliate_click',detail)
    }
  })
}
