import {readFile,writeFile,mkdir} from 'node:fs/promises'
const authMode=process.env.ADMIN_AUTH_MODE??'access'
if(!['password','access'].includes(authMode))throw new Error('Invalid ADMIN_AUTH_MODE')
const names=['ADMIN_ORIGIN','CF_D1_DATABASE_ID','CF_D1_DATABASE_NAME','CF_ZONE_NAME','OWNER_EMAIL','ACCESS_TEAM',...(authMode==='access'?['ACCESS_AUD']:[]),'BUILD_ACCESS_AUD','BUILD_SERVICE_SUB','GITHUB_REPOSITORY_TARGET','GITHUB_REF_TARGET','PUBLISH_ENVIRONMENT']
for(const name of names)if(!process.env[name])throw new Error('Missing provider configuration: '+name)
const origin=new URL(process.env.ADMIN_ORIGIN)
if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password||/workers\.dev$/.test(origin.hostname)||process.env.CF_D1_DATABASE_ID==='00000000-0000-0000-0000-000000000000')throw new Error('Approved custom hostname and real database required')
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'))
config.name=process.env.CF_WORKER_NAME||config.name
if(!/^[a-z0-9][a-z0-9-]{0,62}$/.test(config.name))throw new Error('Invalid approved Worker name')
delete config.env
config.main='../worker/index.ts';config.assets.directory='../dist';config.d1_databases[0].database_id=process.env.CF_D1_DATABASE_ID;config.d1_databases[0].database_name=process.env.CF_D1_DATABASE_NAME;config.d1_databases[0].migrations_dir='../migrations'
config.routes=[{pattern:origin.hostname+'/*',zone_name:process.env.CF_ZONE_NAME}]
config.vars=Object.fromEntries(['ADMIN_ORIGIN','REDIRECT_SELF_HOSTS','OWNER_EMAIL','ACCESS_TEAM','ACCESS_AUD','BUILD_ACCESS_AUD','BUILD_SERVICE_SUB','PUBLISH_ENVIRONMENT'].filter(key=>process.env[key]).map(key=>[key,process.env[key]]))
config.vars.ADMIN_AUTH_MODE=authMode;config.vars.ADMIN_LOCAL_SETUP='false'
config.vars.ADMIN_ORIGIN=origin.origin
config.vars.GITHUB_REPOSITORY=process.env.GITHUB_REPOSITORY_TARGET;config.vars.GITHUB_REF=process.env.GITHUB_REF_TARGET
await mkdir('.wrangler',{recursive:true});await writeFile('.wrangler/provider.json',JSON.stringify(config,null,2))
console.log('Provider config rendered. Existing Worker secrets and Access policies must already be configured.')
