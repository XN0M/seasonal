import type {Env} from './types'
interface Claims {iss:string;aud:string[];exp:number;iat:number;sub:string;email?:string;nbf?:number}
const keys=new Map<string,{expires:number;keys:JsonWebKey[]}>()
const encoder=new TextEncoder()
export const privateHeaders={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",'X-Frame-Options':'DENY','Strict-Transport-Security':'max-age=31536000; includeSubDomains','Permissions-Policy':'camera=(), microphone=(), geolocation=()'}
function decode(value:string){return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))}
export async function identity(request:Request,env:Env,service=false):Promise<Claims> {
 if(!env.ADMIN_ORIGIN||new URL(request.url).origin!==env.ADMIN_ORIGIN||!env.ACCESS_TEAM||!/^[a-z0-9-]+$/.test(env.ACCESS_TEAM)||!env.CSRF_SECRET||env.CSRF_SECRET.length<32)throw new Error('Auth not configured or forbidden host')
 const audience=service?env.BUILD_ACCESS_AUD:env.ACCESS_AUD
 if(!audience||(!service&&!env.OWNER_EMAIL)||(service&&!env.BUILD_SERVICE_SUB))throw new Error('Identity policy not configured')
 const token=request.headers.get('Cf-Access-Jwt-Assertion')??''
 if(token.length>12000)throw new Error('Token too large')
 const parts=token.split('.');if(parts.length!==3)throw new Error('Missing JWT')
 const header=JSON.parse(new TextDecoder().decode(decode(parts[0]!))) as {alg?:unknown;kid?:unknown}
 if(header.alg!=='RS256'||typeof header.kid!=='string')throw new Error('Unsupported JWT')
 const issuer=`https://${env.ACCESS_TEAM}.cloudflareaccess.com`
 let cache=keys.get(issuer)
 if(!cache||cache.expires<Date.now()){
  const response=await fetch(`${issuer}/cdn-cgi/access/certs`,{signal:AbortSignal.timeout(5000),redirect:'error'})
  if(!response.ok)throw new Error('Identity keys unavailable')
  const body=await response.json() as {keys:JsonWebKey[]}
  if(!Array.isArray(body.keys)||body.keys.length>20)throw new Error('Invalid key set')
  cache={expires:Date.now()+300000,keys:body.keys};keys.set(issuer,cache)
 }
 const jwk=cache.keys.find(key=>(key as JsonWebKey&{kid:string}).kid===header.kid&&key.kty==='RSA')
 if(!jwk)throw new Error('Unknown signing key')
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify'])
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]!),encoder.encode(`${parts[0]}.${parts[1]}`)))throw new Error('Invalid signature')
 const claims=JSON.parse(new TextDecoder().decode(decode(parts[1]!))) as Claims
 const now=Math.floor(Date.now()/1000)
 if(claims.iss!==issuer||!Array.isArray(claims.aud)||!claims.aud.includes(audience)||!Number.isFinite(claims.exp)||!Number.isFinite(claims.iat)||claims.exp<=now||claims.exp<=claims.iat||(claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf>now))||claims.iat>now+30||claims.exp-claims.iat>3600||!claims.sub)throw new Error('Invalid claims')
 if(service?(claims.sub!==env.BUILD_SERVICE_SUB||Boolean(claims.email)):(claims.email!==env.OWNER_EMAIL))throw new Error('Not permitted')
 return claims
}
export async function csrf(env:Env,claims:Claims) {
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.CSRF_SECRET!),{name:'HMAC',hash:'SHA-256'},false,['sign'])
 return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(`${claims.sub}:${claims.exp}`))))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
}
export async function checkWrite(request:Request,env:Env,claims:Claims){
 if(request.headers.get('Origin')!==env.ADMIN_ORIGIN||request.headers.get('X-CSRF-Token')!==await csrf(env,claims)||request.headers.get('Content-Type')?.split(';')[0]!=='application/json')throw new Error('Origin or CSRF rejected')
}
