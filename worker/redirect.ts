import {brandRegistry as base} from '../src/data/brand-base'
import {brandLinkValidation} from '../src/lib/brands'
import {brandAffiliateLinkSchema} from '../src/lib/schemas'
import type {Context,Env,LinkRow} from './types'
import {customTarget} from './custom-target'
import {now,bangkokDay} from './store'
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Strict-Transport-Security':'max-age=31536000; includeSubDomains'}
export function eligibleRequest(request:Request){
 const ua=request.headers.get('User-Agent')??''
 const purpose=[request.headers.get('Purpose'),request.headers.get('Sec-Purpose'),request.headers.get('X-Purpose')].join(' ')
 return !/bot|crawler|spider|preview|facebookexternalhit|slack|discord|headless|curl|wget/i.test(ua)&&!/prefetch|preview|prerender/i.test(purpose)
}
async function record(env:Env,request:Request,row:LinkRow|null,status:number){
 const timestamp=now(),day=bangkokDay()
 const eligible=Number(status===302&&eligibleRequest(request)),id=row?.id??'unknown',brand=row?row.brand_id:null,campaign=row?.campaign_label??'unknown',event=row?.event_id??null,channel=row?.channel??'unknown'
 await env.DB.batch([
  env.DB.prepare('INSERT INTO redirect_events VALUES (?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),timestamp,day,id,brand,campaign,event,channel,status,eligible),
  env.DB.prepare('INSERT INTO redirect_daily VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(day,redirect_id,result) DO UPDATE SET requests=requests+1,estimated_clicks=estimated_clicks+excluded.estimated_clicks').bind(day,id,brand,campaign,event,channel,status,1,eligible)
 ])
}
export async function redirect(request:Request,env:Env,ctx:Context):Promise<Response>{
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'GET, HEAD'}})
 const slug=new URL(request.url).pathname.slice(3)
 let row:LinkRow|null=null,status=503,destination:string|undefined
 try{
  row=await env.DB.prepare('SELECT * FROM redirect_links WHERE slug=?').bind(slug).first<LinkRow>()
  if(!row)status=404
  else if(row.status!=='active'||(row.expires_at&&(!Number.isFinite(Date.parse(row.expires_at))||Date.parse(row.expires_at)<=Date.now())))status=410
  else if(row.target_kind==='custom'){
   if(!row.destination_url||!row.destination_hostname||row.brand_id!==null||row.system!==0)status=503
   else{
    const target=customTarget(row.destination_url,env)
    if(target.hostname!==row.destination_hostname)status=503
    else{status=302;destination=target.url}
   }
  }
  else {
   const stored=await env.DB.prepare('SELECT * FROM destinations WHERE brand_id=?').bind(row.brand_id).first<{link_json:string;profile_status:string;merchant_status:string}>()
   const profile=base.profiles.find(p=>p.id===row!.brand_id),merchant=base.merchants.find(m=>m.id===profile?.id+'-merchant'),original=base.links.find(l=>l.brandId===profile?.id)
   if(!stored||!profile||!merchant||!original)status=503
   else{
    const link=brandAffiliateLinkSchema.parse(JSON.parse(stored.link_json))
    if(link.affiliateUrl!==original.affiliateUrl||link.trackingId!==original.trackingId||link.brandId!==row.brand_id||link.merchantId!==original.merchantId)status=503
    else if(stored.profile_status!=='active'||stored.merchant_status!=='active'||link.status!=='active')status=410
    else if(!brandLinkValidation(link,profile,merchant,row.market as 'GB'|'DE'|'FR',new Date(),row.locale as 'en-gb'|'de-de'|'fr-fr').valid)status=410
    else {status=302;destination=link.affiliateUrl}
   }
  }
 }catch{status=503}
 if(request.method==='GET')ctx.waitUntil(record(env,request,row,status).catch(()=>{console.warn('Redirect statistics write failed; destination response unaffected')}))
 return new Response(request.method==='HEAD'||status===302?null:status===410?'This link is currently unavailable.':status===404?'Link not found.':'Please try again later.',{status,headers:{...headers,...(destination?{Location:destination}:{})}})
}
