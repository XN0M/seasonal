// Actual Wrangler runtime QA, ONLY on a dedicated loopback fixture with an isolated database.
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
const origin='http://127.0.0.1:5394'
if(process.env.ALLOW_ISOLATED_LINK_QA!=='true')throw new Error('Requires explicit isolated local fixture opt-in; never run against owner/live database')
const credentials={email:'owner@example.invalid',password:'Isolated link QA password 2026!'}
const post=(path,input,headers={})=>fetch(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(input),redirect:'manual'})
const setup=await post('/_manage/auth/setup',credentials);assert.equal(setup.status,201,'Use a fresh isolated database and fixture owner configuration')
const login=await post('/_manage/auth/login',credentials);assert.equal(login.status,200)
const cookie=login.headers.get('set-cookie').split(';')[0]
const bootstrap=await (await fetch(origin+'/_manage/api/bootstrap',{headers:{Cookie:cookie}})).json()
const headers={Cookie:cookie,'X-CSRF-Token':bootstrap.csrf}
const slug='runtime-custom-'+Date.now(),target='https://unlisted-merchant.example/item?ref=Exact%2FA&rfsn=42.X&utm_source=QA#Selected'
assert.equal((await post('/_manage/api/links',{kind:'custom',slug,affiliateUrl:target})).status,401)
assert.equal((await post('/_manage/api/links',{kind:'custom',slug,affiliateUrl:target},{Cookie:cookie})).status,403)
const created=await post('/_manage/api/links',{kind:'custom',slug,affiliateUrl:target},headers);assert.equal(created.status,201)
const link=await created.json();assert.equal(link.redirectUrl,origin+'/r/'+slug)
assert.equal((await post('/_manage/api/links',{kind:'custom',slug,affiliateUrl:target},headers)).status,409)
const readings=[]
for(let index=0;index<100;index++){
 const start=performance.now(),response=await fetch(origin+'/r/'+slug+'?url=https://wrong.example&next=wrong&ref=wrong',{redirect:'manual',headers:{'User-Agent':'Headless-QA-benchmark'}})
 readings.push(performance.now()-start)
 assert.equal(response.status,302);assert.equal(response.headers.get('location'),target);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(await response.text(),'')
}
assert.equal((await fetch(origin+'/r/'+slug,{method:'HEAD',redirect:'manual'})).status,302)
assert.equal((await fetch(origin+'/r/'+slug,{method:'POST',redirect:'manual'})).status,405)
let stats
for(let attempt=0;attempt<50;attempt++){
 const data=await (await fetch(origin+'/_manage/api/stats?days=7',{headers:{Cookie:cookie}})).json()
 stats=data.rows.find(row=>row.redirect_id===link.id)
 if(stats?.requests===100)break
 await new Promise(resolve=>setTimeout(resolve,20))
}
assert.equal(stats.requests,100);assert.equal(stats.estimated_clicks,0);assert.equal(stats.brand_id,null);assert.equal(stats.destination_hostname,'unlisted-merchant.example')
for(const [status,expected] of [['paused',410],['active',302],['archived',410]]){
 assert.equal((await post('/_manage/api/link-status',{id:link.id,status},headers)).status,200)
 assert.equal((await fetch(origin+'/r/'+slug,{redirect:'manual',headers:{'User-Agent':'Headless-QA'}})).status,expected)
}
assert.equal((await post('/_manage/api/link-status',{id:link.id,status:'active'},headers)).status,409)
assert.equal((await post('/_manage/api/links',{kind:'custom',slug,affiliateUrl:target},headers)).status,409)
assert.equal((await post('/_manage/api/links',{kind:'custom',slug:'bad-loop',affiliateUrl:'https://evenal.click/r/'+slug},headers)).status,400)
assert.equal((await post('/_manage/api/links',{kind:'custom',slug:'bad-private',affiliateUrl:'https://127.0.0.1/'},headers)).status,400)
const exported=await (await fetch(origin+'/_manage/api/export',{headers:{Cookie:cookie}})).json()
assert.equal(exported.schemaVersion,2);assert.equal(exported.tables.redirect_links.find(row=>row.id===link.id).destination_url,target)
assert.equal((await post('/_manage/api/logout',{},headers)).status,200)
assert.equal((await fetch(origin+'/_manage/api/bootstrap',{headers:{Cookie:cookie}})).status,401)
const sorted=[...readings].sort((a,b)=>a-b),p95=sorted[Math.ceil(sorted.length*.95)-1]
const report={testedAt:new Date().toISOString(),origin,requests:100,p95ms:p95,medianMs:sorted[50],maxMs:sorted.at(-1),pass:p95<=100,checks:'Real Wrangler/D1/password-session: unlisted target, default metadata, original URL, no body, CSRF, query isolation, duplicate, HEAD/405, statistics, pause/resume/archive, self/private target refusal, export/logout',metric:'Local end-to-end HTTP response time; not international latency, CPU-only handling, merchant loading or production auth evidence'}
await mkdir('docs/qa',{recursive:true});await writeFile('docs/qa/custom-link-runtime.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1
