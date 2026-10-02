import {beforeAll,beforeEach,afterEach,describe,it,expect} from 'vitest'
import worker from '../worker/index'
import {hashPassword,authRetention} from '../worker/password'
import {seed} from '../worker/store'
import {TestD1} from './helpers/d1'
import type {Env} from '../worker/types'
const origin='https://evenal-fixture.invalid',email='owner@example.invalid',password='A fixture password that is not real 2026!'
let db:TestD1,env:Env,hash:string
beforeAll(async()=>{hash=await hashPassword(password)})
beforeEach(async()=>{db=new TestD1();await seed(db);env={DB:db,ADMIN_AUTH_MODE:'password',ADMIN_ORIGIN:origin,OWNER_EMAIL:email,CSRF_SECRET:'fixture-only-secret-with-at-least-32-characters',ASSETS:{async fetch(){return Response.json({revisionId:'local-source',campaignSlugs:[]})}}};await db.prepare("INSERT INTO admin_credentials VALUES ('owner',?,?,1,?)").bind(email,hash,new Date().toISOString()).run()})
afterEach(()=>db.close())
async function call(path:string,input?:unknown,cookie='',headers:Record<string,string>={},requestOrigin=origin){return worker.fetch(new Request(requestOrigin+path,{method:input===undefined?'GET':'POST',headers:{...(input===undefined?{}:{Origin:origin,'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...headers},...(input===undefined?{}:{body:JSON.stringify(input)})}),env,{waitUntil(){}})}
async function signin(){const response=await call('/_manage/auth/login',{email,password});expect(response.status).toBe(200);return response.headers.get('set-cookie')!.split(';')[0]!}
describe('single-owner password boundary',()=>{
 it('accepts a one-character password but rejects empty and overlong passwords',async()=>{
  await expect(hashPassword('x')).resolves.toMatch(/^scrypt\$/)
  await expect(hashPassword('')).rejects.toThrow('1–128')
  await expect(hashPassword('x'.repeat(129))).rejects.toThrow('1–128')
 })
 it('exposes only login assets, redirects admin shell and refuses private data/scripts',async()=>{
  expect((await call('/_manage/')).status).toBe(303)
  for(const path of ['/_manage/login/','/_manage/login.js','/_manage/login.css']){const response=await call(path);expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store')}
  for(const path of ['/_manage/api/bootstrap','/_manage/admin.js','/%5fmanage/admin.css'])expect((await call(path)).status).toBe(401)
  expect((await call('/_manage/api/bootstrap',undefined,'',{'Cf-Access-Authenticated-User-Email':email,'Cf-Access-Jwt-Assertion':'fake'})).status).toBe(401)
 })
 it('sets host-only secure HttpOnly Strict cookie; saves only opaque keyed session hashes',async()=>{
  const response=await call('/_manage/auth/login',{email,password}),cookie=response.headers.get('set-cookie')!
  expect(response.status).toBe(200);expect(cookie).toContain('__Host-seasonal_admin=');expect(cookie).toContain('HttpOnly');expect(cookie).toContain('SameSite=Strict');expect(cookie).toContain('Secure');expect(cookie).not.toContain('Domain=')
  const rows=(await db.prepare('SELECT * FROM admin_sessions').all()).results
  expect(JSON.stringify(rows)).not.toContain(cookie.split(';')[0]!.split('=')[1]!)
  expect((await call('/_manage/api/bootstrap',undefined,cookie.split(';')[0])).status).toBe(200)
  expect((await call('/_manage/api/bootstrap',undefined,'__Host-seasonal_admin='+'f'.repeat(64))).status).toBe(401)
 })
 it('does not authenticate other emails, wrong passwords, fake claims or bypass origins',async()=>{
  expect((await call('/_manage/auth/login',{email:'other@example.invalid',password})).status).toBe(401)
  expect((await call('/_manage/auth/login',{email,password:'incorrect'})).status).toBe(401)
  const cookie=await signin()
  expect((await call('/_manage/api/bootstrap',undefined,cookie,{},'https://bypass.workers.dev')).status).toBe(403)
  expect((await call('/_manage/auth/login',{email,password},'',{Origin:'https://evil.invalid'})).status).toBe(403)
  expect((await call('/_manage/auth/login',{email,password},'',{'Content-Type':'text/plain'})).status).toBe(403)
 })
 it('expires in one hour, rejects duplicates and invalidates sessions on credential reset',async()=>{
  const cookie=await signin()
  expect((await call('/_manage/api/bootstrap',undefined,cookie+'; '+cookie)).status).toBe(401)
  await db.prepare("UPDATE admin_sessions SET expires_at=1").run()
  expect((await call('/_manage/api/bootstrap',undefined,cookie)).status).toBe(401)
  const fresh=await signin();await db.prepare("UPDATE admin_credentials SET version=2 WHERE id='owner'").run()
  expect((await call('/_manage/api/bootstrap',undefined,fresh)).status).toBe(401)
  await authRetention(env);expect((await db.prepare('SELECT * FROM admin_sessions').all()).results).toHaveLength(1)
 })
 it('requires CSRF for writes/logout and revokes the server session on logout',async()=>{
  const cookie=await signin()
  expect((await call('/_manage/api/logout',{},cookie)).status).toBe(403)
  const {csrf}=await (await call('/_manage/api/bootstrap',undefined,cookie)).json() as {csrf:string}
  expect((await call('/_manage/api/logout',{},cookie,{'X-CSRF-Token':csrf,Origin:'https://evil.invalid'})).status).toBe(403)
  const response=await call('/_manage/api/logout',{},cookie,{'X-CSRF-Token':csrf});expect(response.status).toBe(200);expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
  expect((await call('/_manage/api/bootstrap',undefined,cookie)).status).toBe(401)
 })
 it('atomically bounds account-wide attempts to five per 15 minutes',async()=>{
  const statuses=await Promise.all(Array.from({length:8},async()=> (await call('/_manage/auth/login',{email,password:'wrong password'})).status))
  expect(statuses.filter(status=>status===401)).toHaveLength(5);expect(statuses.filter(status=>status===429)).toHaveLength(3)
  expect((await call('/_manage/auth/login',{email,password})).status).toBe(429)
  await db.prepare('UPDATE admin_login_limit SET window_start=1').run();expect((await call('/_manage/auth/login',{email,password})).status).toBe(200)
 },15000)
 it('allows first setup once on explicitly enabled loopback, never on remote HTTP/HTTPS',async()=>{
  await db.prepare('DELETE FROM admin_credentials').run();env.ADMIN_LOCAL_SETUP='true'
  expect((await call('/_manage/auth/setup',{email,password})).status).toBe(403)
  env.ADMIN_ORIGIN='http://127.0.0.1:5181'
  const local=(value:unknown)=>call('/_manage/auth/setup',value,'',{Origin:env.ADMIN_ORIGIN!},env.ADMIN_ORIGIN!)
  expect((await local({email:'other@example.invalid',password})).status).toBe(403)
  expect((await local({email,password:''})).status).toBe(400)
  expect((await local({email,password:'x'})).status).toBe(201)
  expect((await local({email,password})).status).toBe(403)
  expect((await call('/_manage/auth/status',undefined,'',{},env.ADMIN_ORIGIN)).status).toBe(200)
  const stored=await db.prepare("SELECT password_hash FROM admin_credentials").first<{password_hash:string}>();expect(stored?.password_hash).toMatch(/^scrypt\$/);expect(stored?.password_hash).not.toContain(password)
 })
 it('fails closed on missing secret, invalid mode, mismatched email and unavailable D1',async()=>{
  env.CSRF_SECRET='short';expect((await call('/_manage/auth/login',{email,password})).status).toBe(403)
  env.CSRF_SECRET='valid-long-secret-of-at-least-32-characters';env.OWNER_EMAIL='other@example.invalid';expect((await call('/_manage/auth/login',{email,password})).status).toBe(503)
  env.OWNER_EMAIL=email;env.DB={prepare(){throw new Error('offline')},async batch(){throw new Error('offline')}}
  expect((await call('/_manage/auth/login',{email,password})).status).toBe(503)
 })
})
