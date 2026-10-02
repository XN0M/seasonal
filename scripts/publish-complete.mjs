const {ADMIN_ORIGIN,CF_ACCESS_CLIENT_ID,CF_ACCESS_CLIENT_SECRET,CONTENT_REVISION,CONTENT_JOB}=process.env
if(!ADMIN_ORIGIN?.startsWith('https://')||!CF_ACCESS_CLIENT_ID||!CF_ACCESS_CLIENT_SECRET||!CONTENT_REVISION||!CONTENT_JOB)throw new Error('Callback configuration required')
const result=process.argv[2]==='published'?'published':'failed'
for(let attempt=0;attempt<3;attempt++){
 const response=await fetch(new URL('/_manage/_build/complete',ADMIN_ORIGIN),{method:'POST',headers:{'CF-Access-Client-Id':CF_ACCESS_CLIENT_ID,'CF-Access-Client-Secret':CF_ACCESS_CLIENT_SECRET,'Content-Type':'application/json'},body:JSON.stringify({revision:CONTENT_REVISION,job:CONTENT_JOB,result}),redirect:'error',signal:AbortSignal.timeout(15000)})
 if(response.ok){console.log('Verified status: '+result);process.exit(0)}
 if(response.status!==409||attempt===2)throw new Error('Callback did not verify publication: '+response.status)
 await new Promise(resolve=>setTimeout(resolve,1000))
}
