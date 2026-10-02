import {z} from 'zod'
import adminDocument from './admin/document.txt'
import adminScript from './admin/script.txt'
import adminStyles from './admin/styles.txt'
import loginDocument from './admin/login.txt'
import loginScript from './admin/login-script.txt'
import {brandRegistry as base} from '../src/data/brand-base'
import {validateContent} from '../src/lib/admin/content'
import {redirectInputSchema,customRedirectInputSchema} from '../src/lib/admin/contracts'
import {customTarget} from './custom-target'
import {identity,csrf,checkWrite,privateHeaders} from './auth'
import {passwordConfigured,passwordIdentity,loginOrigin,loginState,setupOwner,login,logout,sessionCookie,authRetention} from './password'
import {audit,linkModel,now,retention,bangkokDay} from './store'
import {redirect} from './redirect'
import {publish,servedSnapshot,type Job} from './publish'
import type {Context,Env,LinkRow} from './types'
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...privateHeaders,'Content-Type':'application/json; charset=utf-8'}})
async function body(request:Request):Promise<unknown>{
 const reader=request.body?.getReader();if(!reader)throw new Error('Body required')
 const chunks:Uint8Array[]= [];let size=0
 while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>131072){await reader.cancel();throw new RangeError('Body exceeds 128KB')}chunks.push(chunk.value)}
 const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength}
 return JSON.parse(new TextDecoder().decode(buffer)) as unknown
}
async function service(request:Request,env:Env,path:string){
 try{await identity(request,env,true)}catch{return json({error:'Build identity required'},403)}
 if(request.method==='GET'&&path==='/_manage/_build/snapshot'){
  const url=new URL(request.url),revision=url.searchParams.get('revision'),job=url.searchParams.get('job')
  const row=await env.DB.prepare("SELECT r.id,r.content_json FROM revisions r JOIN publish_jobs j ON j.revision_id=r.id WHERE r.id=? AND j.id=? AND j.status IN ('queued','building')").bind(revision,job).first<{id:string;content_json:string}>()
  if(!row)return json({error:'No matching active revision/job'},404)
  await env.DB.batch([
   env.DB.prepare("INSERT INTO audit SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM publish_jobs WHERE id=? AND status='queued')").bind(crypto.randomUUID(),now(),'build-start',row.id,'Authenticated exact-revision read',job),
   env.DB.prepare("UPDATE publish_jobs SET status='building',updated_at=? WHERE id=? AND status='queued'").bind(now(),job)])
  return json({revisionId:row.id,content:validateContent(JSON.parse(row.content_json))})
 }
 if(request.method==='POST'&&path==='/_manage/_build/complete'){
  const input=z.object({job:z.uuid(),revision:z.uuid(),result:z.enum(['published','failed'])}).strict().parse(await body(request))
  const job=await env.DB.prepare("SELECT * FROM publish_jobs WHERE id=? AND revision_id=? AND status IN ('queued','building')").bind(input.job,input.revision).first<Job>()
  if(!job)return json({error:'Stale or unknown job'},409)
  if(input.result==='published'){
   const served=await servedSnapshot(env)
   if(served?.revisionId!==input.revision)return json({error:'Requested revision is not being served'},409)
  }
  await env.DB.batch([env.DB.prepare('UPDATE publish_jobs SET status=?,updated_at=?,error=? WHERE id=?').bind(input.result,now(),input.result==='failed'?'Build or deployment failed; inspect CI logs':null,input.job),audit(env.DB,'build-'+input.result,input.revision)])
  return json({status:input.result})
 }
 return json({error:'Not found'},404)
}
async function admin(request:Request,env:Env,path:string):Promise<Response>{
 let claims:Awaited<ReturnType<typeof identity>>
 try{claims=env.ADMIN_AUTH_MODE==='password'?await passwordIdentity(request,env):await identity(request,env)}catch{
  if(env.ADMIN_AUTH_MODE==='password'){
   try{passwordConfigured(request,env)}catch{return json({error:'Đăng nhập admin chưa được cấu hình cho hostname này.'},403)}
   if(request.method==='GET'&&(path==='/_manage/'||path==='/_manage'))return new Response(null,{status:303,headers:{...privateHeaders,Location:'/_manage/login/'}})
   return json({error:'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'},401)
  }
  return json({error:'Owner authentication required; access is closed until configured'},403)
 }
 const read=request.method==='GET'||request.method==='HEAD'
 if(!read){if(request.method!=='POST')return json({error:'Method not allowed'},405);try{await checkWrite(request,env,claims)}catch{return json({error:'Origin/CSRF rejected'},403)}}
 if(!read&&path==='/_manage/api/logout'&&env.ADMIN_AUTH_MODE==='password'){
  await logout(request,env)
  const response=json({ok:true});response.headers.set('Set-Cookie',sessionCookie(request,'',true));return response
 }
 if(read&&path==='/_manage/api/bootstrap'){
  const draft=await env.DB.prepare("SELECT * FROM drafts WHERE id='main'").first<{version:number;content_json:string}>()
  if(!draft)return json({error:'Apply migration and seed before using admin'},503)
  return json({authMode:env.ADMIN_AUTH_MODE??'access',csrf:await csrf(env,claims),version:draft.version,content:validateContent(JSON.parse(draft.content_json)),brands:base.profiles,photos:base.featuredProducts,links:(await env.DB.prepare('SELECT * FROM redirect_links ORDER BY created_at DESC').all<LinkRow>()).results.map(linkModel),jobs:(await env.DB.prepare('SELECT * FROM publish_jobs ORDER BY created_at DESC LIMIT 30').all<Job>()).results,revisions:(await env.DB.prepare('SELECT id,created_at FROM revisions ORDER BY created_at DESC LIMIT 30').all()).results,audit:(await env.DB.prepare('SELECT * FROM audit ORDER BY occurred_at DESC LIMIT 50').all()).results,served:await servedSnapshot(env),publishingConfigured:Boolean(env.GITHUB_TOKEN&&env.GITHUB_REPOSITORY&&env.GITHUB_REF&&env.PUBLISH_ENVIRONMENT&&env.BUILD_ACCESS_AUD&&env.BUILD_SERVICE_SUB)})
 }
 if(read&&path==='/_manage/api/stats'){
  const days=new URL(request.url).searchParams.get('days')==='7'?7:30,cutoff=bangkokDay(new Date(Date.now()-(days-1)*86400000))
  return json({timeZone:'Asia/Bangkok',days,rows:(await env.DB.prepare('SELECT d.*,r.target_kind,r.destination_hostname FROM redirect_daily d LEFT JOIN redirect_links r ON r.id=d.redirect_id WHERE d.day>=? ORDER BY d.day DESC,d.campaign').bind(cutoff).all()).results})
 }
 if(read&&path==='/_manage/api/export'){
  const tables=['destinations','redirect_links','drafts','revisions','publish_jobs','settings','redirect_daily','audit'] as const
  const result:Record<string,unknown>={}
  for(const table of tables)result[table]=(await env.DB.prepare(`SELECT * FROM ${table}`).all()).results
  await audit(env.DB,'export','database','Owner-only backup export').run()
  return json({schemaVersion:2,exportedAt:now(),tables:result})
 }
 if(!read&&path==='/_manage/api/draft'){
  const input=z.object({version:z.number().int().positive(),content:z.unknown()}).strict().parse(await body(request)),content=validateContent(input.content)
  const result=await env.DB.batch<{meta:{changes:number}}>([
   env.DB.prepare("INSERT INTO audit SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM drafts WHERE id='main' AND version=?)").bind(crypto.randomUUID(),now(),'draft-save','main','review pending',input.version),
   env.DB.prepare("UPDATE drafts SET version=version+1,content_json=?,updated_at=? WHERE id='main' AND version=?").bind(JSON.stringify(content),now(),input.version)
  ])
  if(result[1]?.meta.changes!==1)return json({error:'Version conflict: keep your form, reload and reconcile'},409)
  return json({version:input.version+1})
 }
 if(!read&&path==='/_manage/api/links'){
  const raw=await body(request),custom=typeof raw==='object'&&raw!==null&&'kind' in raw&&raw.kind==='custom'
  const input=custom?customRedirectInputSchema.parse(raw):redirectInputSchema.parse(raw)
  if(input.slug.startsWith('brand-')||(input.expiresAt&&Date.parse(input.expiresAt)<=Date.now()))return json({error:'Non-reserved slug and future expiry required'},400)
  let target:{url:string;hostname:string}|undefined
  if('kind' in input){try{target=customTarget(input.affiliateUrl,env)}catch(error){return json({error:error instanceof Error?error.message:'Invalid affiliate URL'},400)}}
  else if(!base.links.some(link=>link.brandId===input.brandId))return json({error:'Approved brand required'},400)
  if(await env.DB.prepare('SELECT id FROM redirect_links WHERE slug=?').bind(input.slug).first())return json({error:'Slug has already been used'},409)
  const id=crypto.randomUUID()
  const brand='brandId' in input?input:null
  try{await env.DB.batch([env.DB.prepare('INSERT INTO redirect_links (id,slug,brand_id,locale,market,event_id,channel,campaign_label,status,expires_at,checklist_json,system,created_at,target_kind,destination_url,destination_hostname) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,input.slug,brand?.brandId??null,brand?.locale??null,brand?.market??null,brand?.eventId??null,input.channel,input.campaignLabel||input.slug,'active',input.expiresAt,JSON.stringify(brand?.checklist??{}),0,now(),target?'custom':'brand',target?.url??null,target?.hostname??null),audit(env.DB,'link-create',id,target?'custom':'brand')])}
  catch(error){if(error instanceof Error&&/unique|constraint/i.test(error.message))return json({error:'Slug has already been used or conflicts with an existing link'},409);throw error}
  return json({id,redirectUrl:new URL('/r/'+input.slug,env.ADMIN_ORIGIN!).href,kind:target?'custom':'brand'},201)
 }
 if(!read&&path==='/_manage/api/link-status'){
  const input=z.object({id:z.string(),status:z.enum(['active','paused','archived'])}).strict().parse(await body(request))
  const row=await env.DB.prepare('SELECT * FROM redirect_links WHERE id=?').bind(input.id).first<LinkRow>()
  if(!row)return json({error:'Link not found'},404)
  if(row.status==='archived'||(row.system&&input.status==='archived'))return json({error:'Archived is final; system links cannot be archived'},409)
  await env.DB.batch([env.DB.prepare('UPDATE redirect_links SET status=? WHERE id=?').bind(input.status,input.id),audit(env.DB,'link-'+input.status,input.id)])
  return json({status:input.status})
 }
 if(!read&&path==='/_manage/api/publish'){
  const input=z.object({version:z.number().int().positive()}).strict().parse(await body(request))
  return json(await publish(env,input.version),202)
 }
 if(!read&&path==='/_manage/api/rollback'){
  const input=z.object({revision:z.uuid(),version:z.number().int().positive()}).strict().parse(await body(request))
  const revision=await env.DB.prepare('SELECT content_json FROM revisions WHERE id=?').bind(input.revision).first<{content_json:string}>()
  if(!revision)return json({error:'Revision not found'},404)
  const result=await env.DB.batch<{meta:{changes:number}}>([
   env.DB.prepare("INSERT INTO audit SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM drafts WHERE id='main' AND version=?)").bind(crypto.randomUUID(),now(),'rollback-to-draft',input.revision,'Live link states unchanged',input.version),
   env.DB.prepare("UPDATE drafts SET version=version+1,content_json=?,updated_at=? WHERE id='main' AND version=?").bind(JSON.stringify(validateContent(JSON.parse(revision.content_json))),now(),input.version)])
  if(result[1]?.meta.changes!==1)return json({error:'Draft version conflict'},409)
  return json({version:input.version+1,note:'Restored to draft. Publish separately. Live paused links unchanged.'})
 }
 if(path.startsWith('/_manage/api/'))return json({error:'Not found'},404)
 if(!read)return json({error:'Method not allowed'},405)
 const assets:Record<string,[string,string]>={'/_manage/':[adminDocument,'text/html; charset=utf-8'],'/_manage':[adminDocument,'text/html; charset=utf-8'],'/_manage/admin.js':[adminScript,'text/javascript; charset=utf-8'],'/_manage/admin.css':[adminStyles,'text/css; charset=utf-8']}
 const asset=assets[path];if(!asset)return json({error:'Not found'},404)
 return new Response(request.method==='HEAD'?null:asset[0],{headers:{...privateHeaders,'Content-Type':asset[1]}})
}
async function authentication(request:Request,env:Env,path:string){
 try{passwordConfigured(request,env)}catch{return json({error:'Đăng nhập admin chưa được cấu hình cho hostname này.'},403)}
 if(request.method==='GET'||request.method==='HEAD'){
  const assets:Record<string,[string,string]>={'/_manage/login/':[loginDocument,'text/html; charset=utf-8'],'/_manage/login':[loginDocument,'text/html; charset=utf-8'],'/_manage/login.js':[loginScript,'text/javascript; charset=utf-8'],'/_manage/login.css':[adminStyles,'text/css; charset=utf-8']}
  const asset=assets[path];if(asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{...privateHeaders,'Content-Type':asset[1]}})
  if(path==='/_manage/auth/status')try{return json(await loginState(request,env))}catch{return json({error:'Cần áp dụng migration và khởi tạo D1 trước.'},503)}
  return json({error:'Not found'},404)
 }
 if(request.method!=='POST')return json({error:'Method not allowed'},405)
 try{loginOrigin(request,env)}catch{return json({error:'Origin rejected'},403)}
 const input=z.object({email:z.email().max(254),password:z.string().min(1).max(128)}).strict().parse(await body(request))
 if(path==='/_manage/auth/setup'){
  try{await setupOwner(request,env,input.email,input.password);return json({ok:true},201)}catch{return json({error:'Không thể khởi tạo: email phải đúng chủ website, mật khẩu mới không để trống (tối đa 128 ký tự), và tài khoản chỉ được tạo một lần trên local.'},403)}
 }
 if(path==='/_manage/auth/login'){
  try{const result=await login(request,env,input.email,input.password);if(result.status!==200){const response=json({error:result.error},result.status);if(result.status===429)response.headers.set('Retry-After','900');return response}
   const response=json({ok:true});response.headers.set('Set-Cookie',sessionCookie(request,result.token));return response
  }catch{return json({error:'Đăng nhập tạm thời chưa sẵn sàng. Kiểm tra cấu hình tài khoản và D1.'},503)}
 }
 return json({error:'Not found'},404)
}
export default {
 async fetch(request:Request,env:Env,ctx:Context):Promise<Response>{
  let path:string;try{path=decodeURIComponent(new URL(request.url).pathname)}catch{return new Response('Invalid path',{status:400})}
  if(path.startsWith('/r/'))return redirect(request,env,ctx)
  if(path==='/_manage'||path.startsWith('/_manage/')){
   try{return path.startsWith('/_manage/_build/')?await service(request,env,path):(path==='/_manage/login'||path==='/_manage/login/'||path==='/_manage/login.js'||path==='/_manage/login.css'||path.startsWith('/_manage/auth/'))?await authentication(request,env,path):await admin(request,env,path)}
   catch(error){if(error instanceof RangeError)return json({error:error.message},413);if(error instanceof SyntaxError)return json({error:'Malformed JSON'},400);if(error instanceof z.ZodError)return json({error:'Invalid input',issues:error.issues.map(issue=>({path:issue.path,message:issue.message}))},400);return json({error:error instanceof Error&&/configured|Draft changed|content|Event membership|image|approved/.test(error.message)?error.message:'Operation failed. Check configuration or conflicting job; nothing is published automatically.'},409)}
  }
  return env.ASSETS.fetch(request)
 },
 async scheduled(_event:unknown,env:Env,ctx:Context){ctx.waitUntil(retention(env.DB));if(env.ADMIN_AUTH_MODE==='password')ctx.waitUntil(authRetention(env))}
}
