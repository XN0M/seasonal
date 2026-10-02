import {writeFile,mkdir} from 'node:fs/promises'
const origin=process.argv[2]||'http://127.0.0.1:5181'
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))throw new Error('This benchmark is local only; staging must be measured separately')
const readings=[]
for(let index=0;index<100;index++){
 const start=performance.now(),response=await fetch(origin+'/r/brand-world-of-cosmetics?url=https://evil.invalid',{redirect:'manual',headers:{'User-Agent':'Headless-QA-benchmark'}})
 const duration=performance.now()-start
 if(response.status!==302||response.headers.get('location')!=='https://www.worldofcosmetics.co.uk/?ref=eghgrllo')throw new Error('Redirect contract failed')
 readings.push(duration);await response.arrayBuffer()
}
const sorted=[...readings].sort((a,b)=>a-b),p95=sorted[Math.ceil(sorted.length*.95)-1]
const report={origin,requests:100,p95ms:p95,medianMs:sorted[50],maxMs:sorted.at(-1),metric:'Local end-to-end response time including HTTP; not international latency or merchant loading',pass:p95<=100}
await mkdir('docs/qa',{recursive:true});await writeFile('docs/qa/admin-redirect-benchmark.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1
