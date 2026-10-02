import {build} from 'esbuild'
import {mkdir} from 'node:fs/promises'
import {spawn} from 'node:child_process'
if(process.env.NODE_ENV!=='test')throw new Error('Isolated test opt-in required')
await mkdir('.wrangler/tools',{recursive:true})
await build({entryPoints:['tests/fixtures/admin-server.ts'],bundle:true,platform:'node',format:'esm',loader:{'.txt':'text'},outfile:'.wrangler/tools/admin-ui-fixture.mjs',logLevel:'silent'})
const child=spawn(process.execPath,['.wrangler/tools/admin-ui-fixture.mjs'],{stdio:'inherit',env:process.env,windowsHide:true})
child.on('exit',code=>{process.exitCode=code??1});process.on('SIGTERM',()=>child.kill())
