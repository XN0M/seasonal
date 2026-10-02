import {build} from 'esbuild'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
const root=process.cwd(),generated=path.join(root,'.wrangler','tools')
await mkdir(generated,{recursive:true})
const outfile=path.join(generated,'data.mjs')
await build({stdin:{contents:"export {seed} from './worker/store'; export {initialContent,validateContent} from './src/lib/admin/content'; export {brandRegistry} from './src/data/brand-base'; export {systemRedirectId} from './src/lib/redirect-path';",resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent'})
const {seed,initialContent,validateContent,brandRegistry,systemRedirectId}=await import(pathToFileURL(outfile).href+'?v='+Date.now())
const mode=process.argv[2]
if(mode==='seed'){
 const queries=[]
 const quote=value=>value===null?'NULL':typeof value==='number'?String(value):"'"+String(value).replaceAll("'","''")+"'"
 const db={prepare(sql){return {bind(...values){let i=0;const query=sql.replace(/\?/g,()=>quote(values[i++]));return {query}}}},async batch(statements){queries.push(...statements.map(statement=>statement.query));return []}}
 await seed(db)
 await writeFile(path.join(generated,'seed.sql'),queries.join(';\n')+';\n')
 console.log('Idempotent local seed generated: .wrangler/tools/seed.sql')
}else if(mode==='manifest'||mode==='landing-manifest'){
 const isolated=mode==='landing-manifest',outdir=isolated?'.wrangler/landing-qa-dist':'dist'
 const source=JSON.parse(await readFile(isolated?path.join(generated,'landing-content.json'):'src/generated/content.json','utf8'))
 const content=source.content===null?null:validateContent(source.content)
 await mkdir(outdir+'/.well-known',{recursive:true})
 await writeFile(outdir+'/.well-known/content-revision.json',JSON.stringify({revisionId:source.revisionId,campaignSlugs:(content?.campaigns??[]).map(c=>c.slug)}))
 await writeFile(outdir+'/.well-known/redirect-manifest.json',JSON.stringify({slugs:[...brandRegistry.links.map(link=>systemRedirectId(link.brandId)),...(content?.campaigns??[]).map(c=>c.slug)]}))
}else if(mode==='fixture'||mode==='landing-fixture'){
 if(process.env.ALLOW_LOCAL_CONTENT_FIXTURE!=='true')throw new Error('Fixture requires explicit local-only opt-in')
 const content=initialContent()
 content.campaigns=[{id:'8f9a1b82-17ac-4cdb-94b9-e02ed50f93ac',slug:'local-preview-cosmetics',brandId:'world-of-cosmetics',locale:'en-gb',market:'GB',eventId:'halloween-2026',channel:'other',campaignLabel:'Local QA preview — not ads-ready',expiresAt:null,status:'active',checklist:{programme:false,channel:false,brandBidding:false,market:false,destination:false}}]
 await writeFile(mode==='landing-fixture'?path.join(generated,'landing-content.json'):'src/generated/content.json',JSON.stringify({revisionId:'local-qa-fixture',content:validateContent(content)}))
}else if(mode==='fixture-seed'||mode==='landing-seed'){
 if(process.env.ALLOW_LOCAL_CONTENT_FIXTURE!=='true')throw new Error('Fixture seed requires explicit local opt-in')
 const source=JSON.parse(await readFile(mode==='landing-seed'?path.join(generated,'landing-content.json'):'src/generated/content.json','utf8'))
 if(source.revisionId!=='local-qa-fixture')throw new Error('Only local fixture can be seeded by this command')
 const c=validateContent(source.content).campaigns[0],quote=value=>value===null?'NULL':"'"+String(value).replaceAll("'","''")+"'"
 const values=[c.id,c.slug,c.brandId,c.locale,c.market,c.eventId,c.channel,c.campaignLabel,'active',null,JSON.stringify(c.checklist),0,new Date().toISOString()]
 await writeFile(path.join(generated,'fixture.sql'),'INSERT OR IGNORE INTO redirect_links (id,slug,brand_id,locale,market,event_id,channel,campaign_label,status,expires_at,checklist_json,system,created_at) VALUES ('+values.map(quote).join(',')+');\n')
}else if(mode==='fixture-cleanup'){
 if(process.env.ALLOW_LOCAL_CONTENT_FIXTURE!=='true')throw new Error('Local fixture cleanup requires opt-in')
 await writeFile(path.join(generated,'fixture-cleanup.sql'),"UPDATE redirect_links SET status='archived' WHERE id='8f9a1b82-17ac-4cdb-94b9-e02ed50f93ac' AND slug='local-preview-cosmetics' AND system=0;\n")
}else if(mode==='reset'){
 await writeFile('src/generated/content.json',JSON.stringify({revisionId:'local-source',content:null})+'\n')
}else throw new Error('Use seed, manifest, fixture, landing-fixture, landing-seed, landing-manifest or reset')
