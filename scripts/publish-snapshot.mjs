import {writeFile,mkdir} from 'node:fs/promises'
const {ADMIN_ORIGIN,CF_ACCESS_CLIENT_ID,CF_ACCESS_CLIENT_SECRET,CONTENT_REVISION,CONTENT_JOB}=process.env
if(!ADMIN_ORIGIN?.startsWith('https://')||!CF_ACCESS_CLIENT_ID||!CF_ACCESS_CLIENT_SECRET||!CONTENT_REVISION||!CONTENT_JOB)throw new Error('Build identity/revision configuration required')
const headers={'CF-Access-Client-Id':CF_ACCESS_CLIENT_ID,'CF-Access-Client-Secret':CF_ACCESS_CLIENT_SECRET}
const response=await fetch(new URL('/_manage/_build/snapshot?'+new URLSearchParams({revision:CONTENT_REVISION,job:CONTENT_JOB}),ADMIN_ORIGIN),{headers,redirect:'error',signal:AbortSignal.timeout(15000)})
if(!response.ok)throw new Error('Authenticated snapshot request failed: '+response.status)
const snapshot=await response.json()
if(snapshot.revisionId!==CONTENT_REVISION||snapshot.content?.schemaVersion!==1)throw new Error('Revision mismatch')
await mkdir('src/generated',{recursive:true})
await writeFile('src/generated/content.json',JSON.stringify(snapshot)+'\n')
