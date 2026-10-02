import type {Env} from './types'
import {brandRegistry as base} from '../src/data/brand-base'
import {validateContent} from '../src/lib/admin/content'
import {audit,linkModel,now} from './store'
import type {LinkRow} from './types'
export interface Job {id:string;revision_id:string;status:string;error:string|null;created_at:string;updated_at:string}
export async function servedSnapshot(env:Env){
 const response=await env.ASSETS.fetch(new Request(new URL('/.well-known/content-revision.json',env.ADMIN_ORIGIN??'https://unconfigured.invalid'),{headers:{'Cache-Control':'no-cache'}}))
 if(!response.ok)return null
 return await response.json() as {revisionId:string;campaignSlugs:string[]}
}
export async function publish(env:Env,version:number){
 if(!env.GITHUB_TOKEN||!env.GITHUB_REPOSITORY||!/^[-\w]+\/[-\w.]+$/.test(env.GITHUB_REPOSITORY)||!env.GITHUB_REF||!env.PUBLISH_ENVIRONMENT||!env.BUILD_ACCESS_AUD||!env.BUILD_SERVICE_SUB)throw new Error('Publish/CI not configured; no job dispatched')
 const draft=await env.DB.prepare('SELECT * FROM drafts WHERE id=?').bind('main').first<{version:number;content_json:string}>()
 if(!draft||draft.version!==version)throw new Error('Draft changed; reload before publishing')
 const links=(await env.DB.prepare("SELECT * FROM redirect_links WHERE target_kind='brand' AND system=0 AND status=? AND (expires_at IS NULL OR expires_at>?)").bind('active',now()).all<LinkRow>()).results
 const systems=(await env.DB.prepare('SELECT r.brand_id,r.status,r.expires_at,d.link_json,d.profile_status,d.merchant_status FROM redirect_links r JOIN destinations d ON d.brand_id=r.brand_id WHERE r.system=1').all<{brand_id:string;status:string;expires_at:string|null;link_json:string;profile_status:string;merchant_status:string}>()).results
 const brandLinkStates=Object.fromEntries(systems.map(row=>{const original=base.links.find(link=>link.brandId===row.brand_id);const stored=JSON.parse(row.link_json) as {affiliateUrl:string;trackingId:string;status:string;expiresAt?:string};if(!original||stored.affiliateUrl!==original.affiliateUrl||stored.trackingId!==original.trackingId)throw new Error('Invalid approved destination data');const active=row.status==='active'&&row.profile_status==='active'&&row.merchant_status==='active'&&stored.status==='active'&&(!row.expires_at||Date.parse(row.expires_at)>Date.now())&&(!stored.expiresAt||Date.parse(stored.expiresAt)>Date.now());return [row.brand_id,active?'active':'paused']}))
 const content=validateContent({...JSON.parse(draft.content_json) as object,brandLinkStates,campaigns:links.map(row=>{const {system:_system,createdAt:_created,kind:_kind,affiliateUrl:_url,hostname:_hostname,...value}=linkModel(row);return value})})
 const revision=crypto.randomUUID(),job=crypto.randomUUID(),timestamp=now()
 await env.DB.batch([
  env.DB.prepare('INSERT INTO revisions VALUES (?,?,?,?)').bind(revision,1,JSON.stringify(content),timestamp),
  env.DB.prepare('INSERT INTO publish_jobs VALUES (?,?,?,?,?,?)').bind(job,revision,'queued',timestamp,timestamp,null),
  audit(env.DB,'publish',revision)
 ])
 try {
  const response=await fetch(`https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/workflows/publish-content.yml/dispatches`,{method:'POST',headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'Content-Type':'application/json','User-Agent':'Seasonal-Edit-Worker','X-GitHub-Api-Version':'2022-11-28'},body:JSON.stringify({ref:env.GITHUB_REF,inputs:{revision,job,environment:env.PUBLISH_ENVIRONMENT}}),signal:AbortSignal.timeout(10000),redirect:'error'})
  if(response.status!==204)throw new Error('Workflow dispatch failed')
 }catch{
  await env.DB.prepare('UPDATE publish_jobs SET status=?,updated_at=?,error=? WHERE id=?').bind('failed',now(),'Workflow dispatch failed; current site unchanged',job).run()
 }
 return {job,revision}
}
