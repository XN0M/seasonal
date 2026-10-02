import {scrypt,randomBytes,timingSafeEqual,createHmac} from 'node:crypto'
import {Buffer} from 'node:buffer'
import {audit,now} from './store'
import type {Env} from './types'

// OWASP equivalent scrypt profile: 16 MiB, N=2^14/r=8/p=5. No new crypto library.
const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>{
 scrypt(password,Buffer.from(salt,'hex'),32,{N:16384,r:8,p:5,maxmem:32*1024*1024},(error,key)=>error?reject(error):resolve(key))
})
export async function hashPassword(password:string){
 if(password.length<1||password.length>128||Buffer.byteLength(password)>512)throw new Error('Password must have 1–128 characters')
 const salt=randomBytes(16).toString('hex')
 return 'scrypt$16384$8$5$'+salt+'$'+(await derive(password,salt)).toString('hex')
}
async function verifyPassword(password:string,hash:string){
 const match=/^scrypt\$16384\$8\$5\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(hash)
 if(!match)throw new Error('Unsupported credential hash')
 return timingSafeEqual(await derive(password,match[1]!),Buffer.from(match[2]!,'hex'))
}
export function passwordConfigured(request:Request,env:Env){
 if(env.ADMIN_AUTH_MODE!=='password'||!env.ADMIN_ORIGIN||new URL(request.url).origin!==env.ADMIN_ORIGIN||!env.OWNER_EMAIL||!env.CSRF_SECRET||env.CSRF_SECRET.length<32)throw new Error('Password authentication not configured')
 const url=new URL(env.ADMIN_ORIGIN)
 if(url.pathname!=='/'||url.search||url.hash||url.username||url.password||url.hostname.endsWith('.workers.dev')||!(url.protocol==='https:'||url.protocol==='http:'&&url.hostname==='127.0.0.1'))throw new Error('Forbidden admin origin')
}
export function localSetupAllowed(request:Request,env:Env){
 return env.ADMIN_LOCAL_SETUP==='true'&&new URL(request.url).origin===env.ADMIN_ORIGIN&&new URL(request.url).protocol==='http:'&&new URL(request.url).hostname==='127.0.0.1'
}
interface Credential {email:string;password_hash:string;version:number}
const credential=(env:Env)=>env.DB.prepare("SELECT email,password_hash,version FROM admin_credentials WHERE id='owner'").first<Credential>()
const seconds=()=>Math.floor(Date.now()/1000)
const sessionHash=(env:Env,token:string)=>createHmac('sha256',env.CSRF_SECRET!).update('admin-session:'+token).digest('hex')
const cookieName=(request:Request)=>new URL(request.url).protocol==='https:'?'__Host-seasonal_admin':'seasonal_admin_local'
function sessionToken(request:Request){
 const name=cookieName(request),values=(request.headers.get('Cookie')??'').split(';').map(value=>value.trim()).filter(value=>value.startsWith(name+'='))
 if(values.length!==1)return ''
 const value=values[0]!.slice(name.length+1)
 return /^[a-f0-9]{64}$/.test(value)?value:''
}
export function sessionCookie(request:Request,token:string,clear=false){
 return `${cookieName(request)}=${clear?'':token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear?0:3600}${new URL(request.url).protocol==='https:'?'; Secure':''}`
}
export async function passwordIdentity(request:Request,env:Env){
 passwordConfigured(request,env)
 const token=sessionToken(request);if(!token)throw new Error('Session required')
 const owner=await credential(env)
 const row=await env.DB.prepare('SELECT credential_version,created_at,expires_at FROM admin_sessions WHERE session_hash=?').bind(sessionHash(env,token)).first<{credential_version:number;created_at:number;expires_at:number}>()
 if(!owner||owner.email!==env.OWNER_EMAIL||!row||row.credential_version!==owner.version||row.expires_at<=seconds()||row.created_at>seconds()||row.expires_at-row.created_at!==3600)throw new Error('Invalid or expired session')
 return {iss:env.ADMIN_ORIGIN!,aud:['password-owner'],sub:sessionHash(env,token),email:owner.email,iat:row.created_at,exp:row.expires_at}
}
export function loginOrigin(request:Request,env:Env){
 if(request.method!=='POST'||request.headers.get('Origin')!==env.ADMIN_ORIGIN||request.headers.get('Content-Type')?.split(';')[0]!=='application/json'||request.headers.get('Sec-Fetch-Site')==='cross-site')throw new Error('Login origin rejected')
}
export async function loginState(request:Request,env:Env){
 passwordConfigured(request,env)
 const owner=await credential(env)
 return {configured:Boolean(owner&&owner.email===env.OWNER_EMAIL),setupAvailable:!owner&&localSetupAllowed(request,env)}
}
export async function setupOwner(request:Request,env:Env,email:string,password:string){
 passwordConfigured(request,env);loginOrigin(request,env)
 if(!localSetupAllowed(request,env)||email!==env.OWNER_EMAIL)throw new Error('Local owner setup unavailable')
 if(await credential(env))throw new Error('Owner already configured')
 const hash=await hashPassword(password)
 const result=await env.DB.prepare("INSERT OR IGNORE INTO admin_credentials VALUES ('owner',?,?,1,?)").bind(email,hash,now()).run()
 if(result.meta.changes!==1)throw new Error('Owner already configured')
 await audit(env.DB,'owner-setup','owner','Loopback-only password setup; no password recorded in audit').run()
}
export async function login(request:Request,env:Env,email:string,password:string){
 passwordConfigured(request,env);loginOrigin(request,env)
 const owner=await credential(env);if(!owner||owner.email!==env.OWNER_EMAIL)throw new Error('Owner not configured')
 const timestamp=seconds()
 // Reserve before hashing, atomically across isolates. Fixed account-wide 5/15-minute window.
 const slot=await env.DB.prepare("INSERT INTO admin_login_limit VALUES ('owner',1,?) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END,window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END WHERE attempts<5 OR window_start<=? RETURNING attempts").bind(timestamp,timestamp-900,timestamp-900,timestamp-900).first<{attempts:number}>()
 if(!slot)return {status:429 as const,error:'Đã thử quá nhiều lần. Vui lòng chờ 15 phút rồi thử lại.'}
 const valid=await verifyPassword(password,owner.password_hash)
 if(!valid||email!==owner.email){await audit(env.DB,'login-failed','owner','Invalid credentials; no submitted email/password/IP recorded').run();return {status:401 as const,error:'Email hoặc mật khẩu không đúng.'}}
 const token=randomBytes(32).toString('hex')
 await env.DB.batch([
  env.DB.prepare('INSERT INTO admin_sessions VALUES (?,?,?,?)').bind(sessionHash(env,token),owner.version,timestamp,timestamp+3600),
  // Do not remove reservations belonging to concurrently running login attempts.
  env.DB.prepare("UPDATE admin_login_limit SET attempts=MAX(attempts-1,0) WHERE id='owner'"),
  audit(env.DB,'login-success','owner','One-hour password session')])
 return {status:200 as const,token}
}
export async function logout(request:Request,env:Env){
 const token=sessionToken(request)
 await env.DB.batch([env.DB.prepare('DELETE FROM admin_sessions WHERE session_hash=?').bind(sessionHash(env,token)),audit(env.DB,'logout','owner')])
}
export async function authRetention(env:Env){
 await env.DB.batch([env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(seconds()),env.DB.prepare('DELETE FROM admin_login_limit WHERE window_start<=?').bind(seconds()-900)])
}
