import {brandRegistry as base} from '../src/data/brand-base'
import {initialContent} from '../src/lib/admin/content'
import {systemRedirectId,type RedirectLink,type BrandRedirectLink} from '../src/lib/admin/contracts'
import type {Database,LinkRow} from './types'
export const now=()=>new Date().toISOString()
export function bangkokDay(date=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date)
 const get=(key:string)=>parts.find(part=>part.type===key)!.value
 return `${get('year')}-${get('month')}-${get('day')}`
}
export function audit(db:Database,action:string,id:string,detail=''){
 return db.prepare('INSERT INTO audit VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),now(),action,id,detail.slice(0,300))
}
export async function seed(db:Database){
 const timestamp=now(),statements=[]
 for(const link of base.links){
  statements.push(db.prepare('INSERT OR IGNORE INTO destinations VALUES (?,?,?,?,?)').bind(link.brandId,JSON.stringify(link),'active','active',timestamp))
  const id=systemRedirectId(link.brandId)
  statements.push(db.prepare('INSERT OR IGNORE INTO redirect_links (id,slug,brand_id,locale,market,event_id,channel,campaign_label,status,expires_at,checklist_json,system,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,id,link.brandId,'en-gb','GB',null,'website','Website: '+link.brandId,'active',null,'{}',1,timestamp))
 }
 statements.push(db.prepare('INSERT OR IGNORE INTO drafts VALUES (?,?,?,?)').bind('main',1,JSON.stringify(initialContent()),timestamp))
 await db.batch(statements)
}
export function linkModel(row:LinkRow):RedirectLink {
 const common={id:row.id,slug:row.slug,channel:row.channel as RedirectLink['channel'],campaignLabel:row.campaign_label,status:row.status,expiresAt:row.expires_at,system:Boolean(row.system),createdAt:row.created_at}
 if(row.target_kind==='custom')return {...common,kind:'custom',affiliateUrl:row.destination_url!,hostname:row.destination_hostname!}
 const affiliateUrl=base.links.find(link=>link.brandId===row.brand_id)?.affiliateUrl??''
 return {...common,kind:'brand',affiliateUrl,hostname:affiliateUrl?new URL(affiliateUrl).hostname:'',brandId:row.brand_id!,locale:row.locale as BrandRedirectLink['locale'],market:row.market as BrandRedirectLink['market'],eventId:row.event_id as BrandRedirectLink['eventId'],checklist:JSON.parse(row.checklist_json) as BrandRedirectLink['checklist']}
}
export async function retention(db:Database){
 const cutoff=new Date(Date.now()-30*86400000).toISOString(),day=bangkokDay(new Date(Date.now()-364*86400000))
 await db.batch([db.prepare('DELETE FROM redirect_events WHERE occurred_at<?').bind(cutoff),db.prepare('DELETE FROM redirect_daily WHERE day<?').bind(day)])
}
