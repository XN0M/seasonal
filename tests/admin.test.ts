import {beforeAll,beforeEach,afterEach,describe,it,expect,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import worker from '../worker/index'
import {seed,retention} from '../worker/store'
import {brandRegistry as base} from '../src/data/brand-base'
import {initialContent,validateContent} from '../src/lib/admin/content'
import {systemRedirectId,redirectInputSchema} from '../src/lib/admin/contracts'
import {TestD1} from './helpers/d1'
import type {Env,Context} from '../worker/types'
import {customTarget} from '../worker/custom-target'
let db:TestD1,env:Env,privateKey:CryptoKey,publicJwk:JsonWebKey
let pending:Promise<unknown>[],servedRevision='local-source',dispatchOk=true
const ctx:Context={waitUntil(promise){pending.push(promise)}}
const origin='https://admin-fixture.invalid'
const encoded=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url')
async function token(overrides:Record<string,unknown>={}){
 const now=Math.floor(Date.now()/1000),head=encoded({alg:'RS256',kid:'fixture-key'}),payload=encoded({iss:'https://fixture-team.cloudflareaccess.com',aud:['owner-aud'],exp:now+300,iat:now,sub:'owner-sub',email:'owner@example.invalid',...overrides}),data=head+'.'+payload
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',privateKey,new TextEncoder().encode(data))
 return data+'.'+Buffer.from(signature).toString('base64url')
}
async function request(path:string,method='GET',input?:unknown,overrides:Record<string,unknown>={},headers:Record<string,string>={}){
 const jwt=await token(overrides)
 if(input!==undefined&&!path.startsWith('/_manage/_build/')){
  const bootstrap=await worker.fetch(new Request(origin+'/_manage/api/bootstrap',{headers:{'Cf-Access-Jwt-Assertion':jwt}}),env,ctx)
  const data=await bootstrap.json() as {csrf:string}
  headers={'Origin':origin,'X-CSRF-Token':data.csrf,...headers}
 }
 return worker.fetch(new Request(origin+path,{method,headers:{'Cf-Access-Jwt-Assertion':jwt,...(input!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(input!==undefined?{body:JSON.stringify(input)}:{})}),env,ctx)
}
const campaign={slug:'cosmetics-october',brandId:'world-of-cosmetics',locale:'en-gb',market:'GB',eventId:'halloween-2026',channel:'google',campaignLabel:'October editorial',expiresAt:null,checklist:{programme:false,channel:false,brandBidding:false,market:false,destination:false}}
const custom={kind:'custom',slug:'my-new-brand',affiliateUrl:'https://new-merchant.example/products?ref=Owner%2FABC&utm_source=Email&rfsn=123.X#collection'}
beforeAll(async()=>{
 const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify'])
 privateKey=pair.privateKey;publicJwk=await crypto.subtle.exportKey('jwk',pair.publicKey)
})
beforeEach(async()=>{
 db=new TestD1();await seed(db);pending=[];servedRevision='local-source';dispatchOk=true
 env={DB:db,ASSETS:{async fetch(){return Response.json({revisionId:servedRevision,campaignSlugs:[]})}},ADMIN_ORIGIN:origin,ACCESS_TEAM:'fixture-team',ACCESS_AUD:'owner-aud',OWNER_EMAIL:'owner@example.invalid',CSRF_SECRET:'isolated-test-secret-at-least-32-characters',BUILD_ACCESS_AUD:'build-aud',BUILD_SERVICE_SUB:'build-sub'}
 vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>{
  const url=String(input)
  if(url==='https://fixture-team.cloudflareaccess.com/cdn-cgi/access/certs')return Response.json({keys:[{...publicJwk,kid:'fixture-key'}]})
  if(url.startsWith('https://api.github.com/'))return new Response(null,{status:dispatchOk?204:500})
  throw new Error('Unexpected external request')
 }))
})
afterEach(async()=>{await Promise.all(pending);db.close();vi.unstubAllGlobals()})
describe('private Access boundary',()=>{
 it('fails closed without configuration, on workers.dev and on direct private assets',async()=>{
  for(const path of ['/_manage/','/_manage/admin.js','/_manage/api/bootstrap','/%5fmanage/admin.css']){
   expect((await worker.fetch(new Request(origin+path),env,ctx)).status).toBe(403)
  }
  expect((await worker.fetch(new Request('https://bypass.workers.dev/_manage/',{headers:{'Cf-Access-Jwt-Assertion':await token()}}),env,ctx)).status).toBe(403)
  const {OWNER_EMAIL:_,...missing}=env
  expect((await worker.fetch(new Request(origin+'/_manage/',{headers:{'Cf-Access-Jwt-Assertion':await token()}}),missing,ctx)).status).toBe(403)
  expect((await worker.fetch(new Request(origin+'/_manage/',{headers:{'Cf-Access-Authenticated-User-Email':env.OWNER_EMAIL!}}),env,ctx)).status).toBe(403)
 })
 it('rejects other email, expiry, audience, issuer, overlong session and forged signatures',async()=>{
  for(const claims of [{email:'other@example.invalid'},{exp:1},{aud:['wrong']},{iss:'https://evil.invalid'},{exp:Math.floor(Date.now()/1000)+7200}]){
   expect((await request('/_manage/', 'GET',undefined,claims)).status).toBe(403)
  }
  const jwt=await token(),forged=jwt.slice(0,-10)+'AAAAAAAAAA'
  expect((await worker.fetch(new Request(origin+'/_manage/',{headers:{'Cf-Access-Jwt-Assertion':forged}}),env,ctx)).status).toBe(403)
 })
 it('serves owner-only UI with strict headers and no-store',async()=>{
  const response=await request('/_manage/');expect(response.status).toBe(200)
  expect(await response.text()).toContain('Không gian quản trị')
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(response.headers.get('content-security-policy')).not.toMatch(/unsafe-inline|unsafe-eval/)
  expect(response.headers.get('x-frame-options')).toBe('DENY')
 })
 it('rejects CSRF/cross-origin and oversize writes',async()=>{
  expect((await request('/_manage/api/draft','POST',{version:1,content:initialContent()},{},{Origin:'https://evil.invalid'})).status).toBe(403)
  expect((await request('/_manage/api/draft','POST',{version:1,content:initialContent()},{},{'X-CSRF-Token':'wrong'})).status).toBe(403)
  expect((await request('/_manage/api/draft','POST',{huge:'x'.repeat(132000)})).status).toBe(413)
 })
})
describe('admin drafts, links and publication',()=>{
 it('has exactly ten immutable destinations and seed never resets pauses or drafts',async()=>{
  await db.prepare("UPDATE redirect_links SET status='paused' WHERE slug=?").bind(systemRedirectId('toybox')).run()
  await db.prepare("UPDATE drafts SET version=2 WHERE id='main'").run()
  await seed(db)
  expect((await db.prepare('SELECT status FROM redirect_links WHERE slug=?').bind(systemRedirectId('toybox')).first<{status:string}>())?.status).toBe('paused')
  expect((await db.prepare("SELECT version FROM drafts WHERE id='main'").first<{version:number}>())?.version).toBe(2)
  expect((await db.prepare('SELECT * FROM destinations').all()).results).toHaveLength(10)
 })
 it('validates every locale, image identity and immutable event membership',()=>{
  const content=initialContent();expect(validateContent(content)).toEqual(content)
  content.brands['toybox']!.coverProductId=base.featuredProducts.find(p=>p.brandId==='be-ove')!.id
  expect(()=>validateContent(content)).toThrow('image')
  const other=initialContent();other.eventPriority['halloween-2026'].push('toybox')
  expect(()=>validateContent(other)).toThrow('membership')
 })
 it('saves draft with optimistic concurrency and no premature public change',async()=>{
  const content=initialContent();content.brands['toybox']!.summary['en-gb']='A distinct test description.'
  expect((await request('/_manage/api/draft','POST',{version:1,content})).status).toBe(200)
  expect((await request('/_manage/api/draft','POST',{version:1,content})).status).toBe(409)
  expect(servedRevision).toBe('local-source')
 })
 it('creates only approved targets, duplicate/archived slugs never reusable, status is live',async()=>{
  expect((await request('/_manage/api/links','POST',{...campaign,brandId:'unknown'})).status).toBe(400)
  expect((await request('/_manage/api/links','POST',{...campaign,url:'https://evil.invalid'})).status).toBe(400)
  const response=await request('/_manage/api/links','POST',campaign),{id}=await response.json() as {id:string}
  expect(response.status).toBe(201)
  expect((await request('/_manage/api/links','POST',campaign)).status).toBe(409)
  await request('/_manage/api/link-status','POST',{id,status:'paused'})
  expect((await worker.fetch(new Request(origin+'/r/'+campaign.slug),env,ctx)).status).toBe(410)
  await request('/_manage/api/link-status','POST',{id,status:'archived'})
  expect((await request('/_manage/api/link-status','POST',{id,status:'active'})).status).toBe(409)
  expect((await request('/_manage/api/links','POST',campaign)).status).toBe(409)
  expect(()=>db.sql.prepare("UPDATE redirect_links SET brand_id='toybox' WHERE id=?").run(id)).toThrow('immutable')
  expect(()=>redirectInputSchema.parse({...campaign,slug:'../x'})).toThrow()
 })
 it('requires real CI configuration; permits only one job; verifies served revision and keeps paused state on rollback',async()=>{
  expect((await request('/_manage/api/publish','POST',{version:1})).status).toBe(409)
  Object.assign(env,{GITHUB_TOKEN:'fixture-only-token',GITHUB_REPOSITORY:'owner/repo',GITHUB_REF:'main',PUBLISH_ENVIRONMENT:'preview'})
  await request('/_manage/api/links','POST',campaign)
  const created=await request('/_manage/api/publish','POST',{version:1});expect(created.status).toBe(202)
  const {job,revision}=await created.json() as {job:string;revision:string}
  expect((await request('/_manage/api/publish','POST',{version:1})).status).toBe(409)
  const service={aud:['build-aud'],sub:'build-sub',email:undefined}
  expect((await request('/_manage/_build/snapshot?revision='+revision+'&job='+job)).status).toBe(403)
  expect((await request('/_manage/_build/snapshot?revision='+revision+'&job='+job,'GET',undefined,service)).status).toBe(200)
  expect((await request('/_manage/_build/complete','POST',{job,revision,result:'published'},service)).status).toBe(409)
  servedRevision=revision
  expect((await request('/_manage/_build/complete','POST',{job,revision,result:'published'},service)).status).toBe(200)
  await request('/_manage/api/link-status','POST',{id:systemRedirectId('toybox'),status:'paused'})
  expect((await request('/_manage/api/rollback','POST',{version:1,revision})).status).toBe(200)
  expect((await worker.fetch(new Request(origin+'/r/brand-toybox'),env,ctx)).status).toBe(410)
  expect(()=>db.sql.prepare('UPDATE revisions SET content_json=? WHERE id=?').run('{}',revision)).toThrow('immutable')
 })
 it('publication snapshots current system pauses rather than draft/rollback visibility',async()=>{
  Object.assign(env,{GITHUB_TOKEN:'fixture-only-token',GITHUB_REPOSITORY:'owner/repo',GITHUB_REF:'main',PUBLISH_ENVIRONMENT:'preview'})
  await request('/_manage/api/link-status','POST',{id:systemRedirectId('toybox'),status:'paused'})
  const response=await request('/_manage/api/publish','POST',{version:1}),{revision}=await response.json() as {revision:string}
  const row=await db.prepare('SELECT content_json FROM revisions WHERE id=?').bind(revision).first<{content_json:string}>()
  expect(validateContent(JSON.parse(row!.content_json)).brandLinkStates.toybox).toBe('paused')
  expect((await worker.fetch(new Request(origin+'/r/brand-toybox'),env,ctx)).status).toBe(410)
 })
 it('dispatch failure preserves currently served content and releases publish lock',async()=>{
  Object.assign(env,{GITHUB_TOKEN:'fixture-only-token',GITHUB_REPOSITORY:'owner/repo',GITHUB_REF:'main',PUBLISH_ENVIRONMENT:'preview'});dispatchOk=false
  await request('/_manage/api/publish','POST',{version:1})
  expect((await db.prepare('SELECT status FROM publish_jobs').first<{status:string}>())?.status).toBe('failed')
  expect(servedRevision).toBe('local-source')
 })
})
describe('redirect correctness and private measurement',()=>{
 it('creates an unlisted custom target immediately with defaults, preserving exact URL and no intermediary assets',async()=>{
  const response=await request('/_manage/api/links','POST',custom)
  expect(response.status).toBe(201)
  expect(await response.json()).toMatchObject({kind:'custom',redirectUrl:origin+'/r/'+custom.slug})
  const bootstrap=await (await request('/_manage/api/bootstrap')).json() as {links:Record<string,unknown>[]}
  expect(bootstrap.links.find(link=>link.slug===custom.slug)).toMatchObject({kind:'custom',campaignLabel:custom.slug,channel:'other',expiresAt:null,affiliateUrl:custom.affiliateUrl,hostname:'new-merchant.example'})
  const result=await worker.fetch(new Request(origin+'/r/'+custom.slug+'?url=https://evil.invalid&next=/other&ref=wrong&redirect=bad'),env,ctx)
  expect(result.status).toBe(302);expect(result.headers.get('Location')).toBe(custom.affiliateUrl);expect(result.headers.get('Cache-Control')).toBe('no-store');expect(await result.text()).toBe('')
  expect(vi.mocked(fetch).mock.calls.every(([url])=>String(url).endsWith('/cdn-cgi/access/certs'))).toBe(true)
 })
 it('requires owner and CSRF for custom links, never adds a public brand, and reserves old slugs',async()=>{
  expect((await worker.fetch(new Request(origin+'/_manage/api/links',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(custom)}),env,ctx)).status).toBe(403)
  expect((await request('/_manage/api/links','POST',custom,{}, {'X-CSRF-Token':'wrong'})).status).toBe(403)
  expect((await request('/_manage/api/links','POST',custom,{email:'another@example.invalid'})).status).toBe(403)
  expect((await request('/_manage/api/links','POST',{...custom,slug:'brand-toybox'})).status).toBe(400)
  await request('/_manage/api/links','POST',campaign)
  expect((await request('/_manage/api/links','POST',{...custom,slug:campaign.slug})).status).toBe(409)
  await request('/_manage/api/links','POST',custom)
  expect((await db.prepare('SELECT * FROM destinations').all()).results).toHaveLength(10)
  expect((await request('/_manage/api/links','POST',{...custom,brandId:'toybox'})).status).toBe(400)
 })
 it.each([
  'http://merchant.example/?ref=1','javascript:alert(1)','https:merchant.example','https://user:pass@merchant.example','https://@merchant.example',
  'https://localhost','https://shop.localhost','https://127.0.0.1','https://10.0.0.1','https://2130706433','https://0x7f000001','https://[::1]','https://[fc00::1]',
  'https://shop.internal','https://shop.local','https://evenal.click/r/loop','https://www.evenal.click/','https://EVENAL.CLICK./r/a',
  'https://seasonal.xuannam4869.workers.dev/r/a','https://preview.seasonal.xuannam4869.workers.dev/r/a','https://admin-fixture.invalid/r/a',
  'https://merchant.example:8443/','https://merchant.example/\nSet-Cookie:x','https://merchant.example/has space','https://merchant.example\\@evil.example'
 ])('rejects unsafe custom target %s',async affiliateUrl=>{
  expect((await request('/_manage/api/links','POST',{...custom,affiliateUrl})).status).toBe(400)
  expect((await db.prepare("SELECT * FROM redirect_links WHERE target_kind='custom'").all()).results).toHaveLength(0)
 })
 it('checks additional self aliases and preserves encoded Unicode, signed queries, case and fragment',()=>{
  expect(()=>customTarget('https://preview.other-own.example/',{REDIRECT_SELF_HOSTS:'other-own.example'})).toThrow('back')
  const url='https://Merchant.example:443/%E2%9C%93?ref=NH&sig=a%2Bb%3D&x=1&x=2#Part'
  expect(customTarget(url,env)).toEqual({url,hostname:'merchant.example'})
 })
 it('keeps target/slug immutable, pauses immediately, archives permanently and expires honestly',async()=>{
  const {id}=await (await request('/_manage/api/links','POST',custom)).json() as {id:string}
  for(const sql of ["UPDATE redirect_links SET destination_url='https://other.example/' WHERE id=?","UPDATE redirect_links SET destination_hostname='other.example' WHERE id=?","UPDATE redirect_links SET target_kind='brand' WHERE id=?","UPDATE redirect_links SET slug='new-name' WHERE id=?"])expect(()=>db.sql.prepare(sql).run(id)).toThrow('immutable')
  await request('/_manage/api/link-status','POST',{id,status:'paused'});expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(410)
  await request('/_manage/api/link-status','POST',{id,status:'active'});expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(302)
  await db.prepare("UPDATE redirect_links SET expires_at='2020-01-01T00:00:00Z' WHERE id=?").bind(id).run();expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(410)
  await request('/_manage/api/link-status','POST',{id,status:'archived'})
  expect((await request('/_manage/api/link-status','POST',{id,status:'active'})).status).toBe(409)
  expect((await request('/_manage/api/links','POST',custom)).status).toBe(409)
  expect((await request('/_manage/api/links','POST',{...custom,slug:'expired-custom',expiresAt:'2020-01-01T00:00:00Z'})).status).toBe(400)
 })
 it('counts custom GET once without HEAD, identities or raw URL; gracefully survives statistics/DB errors',async()=>{
  await request('/_manage/api/links','POST',custom)
  expect((await worker.fetch(new Request(origin+'/r/'+custom.slug,{method:'HEAD'}),env,ctx)).status).toBe(302);expect(pending).toHaveLength(0)
  expect((await worker.fetch(new Request(origin+'/r/'+custom.slug,{method:'POST'}),env,ctx)).status).toBe(405)
  for(const headers of [{'User-Agent':'Mozilla/5.0'},{'User-Agent':'Googlebot'},{'Sec-Purpose':'prefetch'}])await worker.fetch(new Request(origin+'/r/'+custom.slug+'?private=secret',{headers}),env,ctx)
  await Promise.all(pending);pending=[]
  const stats=await (await request('/_manage/api/stats?days=7')).json() as {rows:Record<string,unknown>[]}
  expect(stats.rows).toHaveLength(1);expect(stats.rows[0]).toMatchObject({brand_id:null,campaign:custom.slug,target_kind:'custom',destination_hostname:'new-merchant.example',requests:3,estimated_clicks:1})
  expect(JSON.stringify((await db.prepare('SELECT * FROM redirect_events').all()).results)).not.toMatch(/Owner|private|Mozilla|referrer|email/)
  db.sql.exec('DROP TABLE redirect_events');expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(302)
  await Promise.all(pending);pending=[]
  db.sql.exec('DROP TABLE redirect_links');expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(503)
 })
 it('excludes custom links from publication even when active, without breaking brand campaigns',async()=>{
  const {id}=await (await request('/_manage/api/links','POST',custom)).json() as {id:string};await request('/_manage/api/links','POST',campaign)
  Object.assign(env,{GITHUB_TOKEN:'fixture-only-token',GITHUB_REPOSITORY:'owner/repo',GITHUB_REF:'main',PUBLISH_ENVIRONMENT:'preview'})
  const response=await request('/_manage/api/publish','POST',{version:1});expect(response.status).toBe(202)
  const {revision}=await response.json() as {revision:string}
  const row=await db.prepare('SELECT content_json FROM revisions WHERE id=?').bind(revision).first<{content_json:string}>()
  const content=validateContent(JSON.parse(row!.content_json));expect(content.campaigns.map(link=>link.slug)).toEqual([campaign.slug]);expect(JSON.stringify(content)).not.toContain('new-merchant.example')
  await request('/_manage/api/link-status','POST',{id,status:'paused'})
  expect((await request('/_manage/api/rollback','POST',{revision,version:1})).status).toBe(200)
  expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(410)
 })
 it('fails closed for corrupt stored custom targets and uses 410 for corrupt expiry',async()=>{
  const {id}=await (await request('/_manage/api/links','POST',custom)).json() as {id:string}
  db.sql.exec('DROP TRIGGER redirect_identity_immutable')
  await db.prepare("UPDATE redirect_links SET destination_hostname='wrong.example' WHERE id=?").bind(id).run()
  expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(503)
  await db.prepare("UPDATE redirect_links SET destination_url='https://evenal.click/r/loop',destination_hostname='evenal.click' WHERE id=?").bind(id).run()
  expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(503)
  await db.prepare("UPDATE redirect_links SET expires_at='invalid' WHERE id=?").bind(id).run()
  expect((await worker.fetch(new Request(origin+'/r/'+custom.slug),env,ctx)).status).toBe(410)
 })
 it('handles a concurrent duplicate slug with exactly one stored link/audit',async()=>{
  const results=await Promise.all([request('/_manage/api/links','POST',custom),request('/_manage/api/links','POST',custom)])
  expect(results.map(result=>result.status).sort()).toEqual([201,409])
  expect((await db.prepare('SELECT * FROM redirect_links WHERE slug=?').bind(custom.slug).all()).results).toHaveLength(1)
  expect((await db.prepare("SELECT * FROM audit WHERE action='link-create'").all()).results).toHaveLength(1)
 })
 it('redirects every approved brand/locale without altering original URL or forwarding malicious query',async()=>{
  for(const link of base.links)for(const locale of ['en-gb','de-de','fr-fr']){
   const response=await worker.fetch(new Request(origin+'/r/'+systemRedirectId(link.brandId)+'?url=https://evil.invalid&ref=wrong&locale='+locale),env,ctx)
   expect(response.status).toBe(302);expect(response.headers.get('Location')).toBe(link.affiliateUrl);expect(response.headers.get('Cache-Control')).toBe('no-store');expect(await response.text()).toBe('')
  }
 })
 it('implements HEAD/405/404/410/503 and live pause',async()=>{
  expect((await worker.fetch(new Request(origin+'/r/brand-toybox',{method:'HEAD'}),env,ctx)).status).toBe(302)
  expect(pending).toHaveLength(0)
  expect((await worker.fetch(new Request(origin+'/r/brand-toybox',{method:'POST'}),env,ctx)).status).toBe(405)
  expect((await worker.fetch(new Request(origin+'/r/not-found'),env,ctx)).status).toBe(404)
  await db.prepare("UPDATE redirect_links SET expires_at='2020-01-01T00:00:00Z' WHERE slug='brand-toybox'").run()
  expect((await worker.fetch(new Request(origin+'/r/brand-toybox'),env,ctx)).status).toBe(410)
  await db.prepare("UPDATE destinations SET link_json='invalid' WHERE brand_id='be-ove'").run()
  expect((await worker.fetch(new Request(origin+'/r/brand-be-ove'),env,ctx)).status).toBe(503)
 })
 it('counts GET once, classifies automation without storing personal data and applies retention',async()=>{
  for(const headers of [{'User-Agent':'Mozilla/5.0'},{'User-Agent':'Googlebot'},{'User-Agent':'Mozilla/5.0','Sec-Purpose':'prefetch'}])await worker.fetch(new Request(origin+'/r/brand-toybox?secret=private',{headers}),env,ctx)
  await Promise.all(pending)
  const rows=(await db.prepare('SELECT * FROM redirect_daily').all<{requests:number;estimated_clicks:number}>()).results
  expect(rows[0]).toMatchObject({requests:3,estimated_clicks:1})
  const events=(await db.prepare('SELECT * FROM redirect_events').all()).results
  expect(JSON.stringify(events)).not.toMatch(/Mozilla|private|ip_address|referrer|email/)
  await db.prepare("UPDATE redirect_events SET occurred_at='2020-01-01T00:00:00Z'").run()
  await db.prepare("UPDATE redirect_daily SET day='2020-01-01'").run()
  await retention(db)
  expect((await db.prepare('SELECT * FROM redirect_events').all()).results).toHaveLength(0)
  expect((await db.prepare('SELECT * FROM redirect_daily').all()).results).toHaveLength(0)
 })
 it('statistics failure does not cancel a valid redirect',async()=>{
  db.sql.exec('DROP TABLE redirect_events')
  expect((await worker.fetch(new Request(origin+'/r/brand-toybox'),env,ctx)).status).toBe(302)
  await Promise.all(pending)
 })
 it('export restores approved content/live pause to a separate database, not the live instance',async()=>{
  await request('/_manage/api/links','POST',custom)
  await request('/_manage/api/link-status','POST',{id:systemRedirectId('toybox'),status:'paused'})
  const response=await request('/_manage/api/export'),data=await response.json() as {tables:Record<string,Record<string,unknown>[]>}
  const restore=new TestD1()
  try{
   for(const [table,rows]of Object.entries(data.tables))for(const row of rows){
    const columns=Object.keys(row);await restore.prepare('INSERT INTO '+table+' ('+columns.join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').bind(...Object.values(row)).run()
   }
   expect((await restore.prepare("SELECT status FROM redirect_links WHERE slug='brand-toybox'").first<{status:string}>())?.status).toBe('paused')
   expect((await restore.prepare('SELECT destination_url FROM redirect_links WHERE slug=?').bind(custom.slug).first<{destination_url:string}>())?.destination_url).toBe(custom.affiliateUrl)
   expect((await db.prepare('SELECT * FROM destinations').all()).results).toHaveLength(10)
  }finally{restore.close()}
 })
 it('private assets are not placed in public static output',()=>{
  const html=readFileSync(new URL('../worker/admin/document.txt',import.meta.url),'utf8')
  expect(html).not.toMatch(/unsafe-inline|<script>[^<]/)
 })
})
