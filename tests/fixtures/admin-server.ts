// ISOLATED TEST HARNESS ONLY. Never part of Worker deployment or a login bypass.
import {createServer} from 'node:http'
import {readFileSync} from 'node:fs'
import {TestD1} from '../helpers/d1'
import worker from '../../worker/index'
import {seed} from '../../worker/store'
import type {Env} from '../../worker/types'
if(process.env.NODE_ENV!=='test')throw new Error('Test fixture must never run outside NODE_ENV=test')
const passwordMode=process.env.PASSWORD_AUTH_FIXTURE==='true',port=passwordMode?5393:5392
const origin='http://127.0.0.1:'+port,db=new TestD1(),pending:Promise<unknown>[]=[]
await seed(db)
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify'])
const publicJwk=await crypto.subtle.exportKey('jwk',pair.publicKey)
globalThis.fetch=async(input:RequestInfo|URL)=>{
 if(String(input)==='https://ui-fixture.cloudflareaccess.com/cdn-cgi/access/certs')return Response.json({keys:[{...publicJwk,kid:'ui-fixture'}]})
 throw new Error('External networking forbidden in admin fixture')
}
const env:Env={DB:db,ADMIN_ORIGIN:origin,ACCESS_TEAM:'ui-fixture',ACCESS_AUD:'owner-fixture',OWNER_EMAIL:'owner@example.invalid',CSRF_SECRET:'test-only-csrf-secret-at-least-32-characters',ASSETS:{async fetch(request){const path=new URL(request.url).pathname;if(path==='/.well-known/content-revision.json')return Response.json({revisionId:'local-source',campaignSlugs:[]});if(path.startsWith('/images/brands/'))try{return new Response(readFileSync(process.cwd()+'/public'+path),{headers:{'Content-Type':'image/webp'}})}catch{return new Response(null,{status:404})}return new Response(null,{status:404})}}}
if(passwordMode){env.ADMIN_AUTH_MODE='password';env.ADMIN_LOCAL_SETUP='true'}
const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url')
async function signed(email:string){const now=Math.floor(Date.now()/1000),data=encode({alg:'RS256',kid:'ui-fixture'})+'.'+encode({iss:'https://ui-fixture.cloudflareaccess.com',aud:['owner-fixture'],exp:now+3600,iat:now,sub:'owner-fixture',email}),signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(data));return data+'.'+Buffer.from(signature).toString('base64url')}
const server=createServer(async(req,res)=>{
 try{
  if(req.url==='/__fixture__/ready'){res.end('ISOLATED TEST FIXTURE');return}
  if(req.url==='/__fixture__/token'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({jwt:await signed('owner@example.invalid')}));return}
  const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value)
  const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk as Uint8Array))
  const request=new Request(origin+req.url,{method:req.method??'GET',headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})})
  const response=await worker.fetch(request,env,{waitUntil(promise){pending.push(promise)}})
  res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));res.end(Buffer.from(await response.arrayBuffer()))
 }catch{res.statusCode=500;res.end('Fixture failed')}
})
server.listen(port,'127.0.0.1',()=>console.log('Isolated admin fixture ready on '+origin))
process.on('SIGTERM',()=>{server.close();db.close()})
