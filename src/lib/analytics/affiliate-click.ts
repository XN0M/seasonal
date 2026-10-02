import { localeCodes, marketCodes, type AffiliateClickPayload } from '../types'

/** Legacy product links remain valid; brand links do not invent offer expiry. */
export function readAffiliateClick(raw: string, href: string, expiresAt?: string, now = Date.now(), wrapper?:{origin:string;path:string;affiliateUrl:string}): AffiliateClickPayload | undefined {
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return
    const record=value as Record<string, unknown>
    const allowed=new Set(['targetType','productId','featuredProductId','brandId','merchantId','market','locale','eventId','placement','trackingId','redirectId','campaignId'])
    if(Object.keys(record).some(key=>!allowed.has(key)))return
    for(const key of ['redirectId','campaignId'])if(record[key]!==undefined&&(typeof record[key]!=='string'||!record[key]||!/^[-a-z0-9]+$/.test(record[key] as string)))return
    for (const key of ['brandId','merchantId','eventId','placement','trackingId']) if (typeof record[key]!=='string' || !(record[key] as string).length) return
    if (!marketCodes.some(code=>code===record.market) || !localeCodes.some(code=>code===record.locale)) return
    const targetType=record.targetType ?? 'product'
    if (targetType!=='product' && targetType!=='brand') return
    if (targetType==='product' && (typeof record.productId!=='string' || !record.productId)) return
    if (record.featuredProductId!==undefined && (typeof record.featuredProductId!=='string' || !record.featuredProductId)) return
    const expiry=expiresAt ? Date.parse(expiresAt) : NaN
    if ((targetType==='product' || expiresAt!==undefined) && (!Number.isFinite(expiry) || expiry<=now)) return
    let url=new URL(href)
    if(wrapper&&targetType==='brand'){
      if(url.origin!==wrapper.origin||url.pathname!==wrapper.path||url.search||url.hash||!/^\/r\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(wrapper.path)||typeof record.redirectId!=='string'||!record.redirectId)return
      url=new URL(wrapper.affiliateUrl)
    }
    if (url.protocol!=='https:' || url.username || url.password) return
    if (targetType==='brand' && ![url.searchParams.get('ref'),url.searchParams.get('rfsn')].includes(record.trackingId as string)) return
    return value as AffiliateClickPayload
  } catch { return }
}
