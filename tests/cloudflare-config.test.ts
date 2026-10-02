import {it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
const pkg=JSON.parse(readFileSync('package.json','utf8'))

it('default deploy selects the owner-confirmed Worker/D1 and closes remote first setup',()=>{
 expect(config.name).toBe('seasonal')
 expect(config.d1_databases).toEqual([{binding:'DB',database_name:'sesonal-admin',database_id:'9e596acb-c807-4b53-9166-210c1a0932b4',migrations_dir:'migrations'}])
 expect(config.vars).toMatchObject({ADMIN_AUTH_MODE:'password',ADMIN_ORIGIN:'https://evenal.click',ADMIN_LOCAL_SETUP:'false'})
 expect(config.vars).not.toHaveProperty('CSRF_SECRET')
 expect(config.workers_dev).toBe(false);expect(config.preview_urls).toBe(false)
 expect(config.assets.run_worker_first).toBe(true)
})

it('local commands preserve the original Worker and D1 identity without remote operations',()=>{
 expect(config.env.local.name).toBe('seasonal-affiliate-hub')
 expect(config.env.local.d1_databases[0]).toMatchObject({binding:'DB',database_name:'seasonal-admin-local',database_id:'00000000-0000-0000-0000-000000000000'})
 expect(config.env.local.vars).toMatchObject({ADMIN_AUTH_MODE:'password',ADMIN_ORIGIN:'http://127.0.0.1:5181',ADMIN_LOCAL_SETUP:'false'})
 expect(config.env.local.vars).not.toHaveProperty('CSRF_SECRET')
 for(const key of ['dev:worker','preview:worker','db:local']){expect(pkg.scripts[key]).toContain('--env local');expect(pkg.scripts[key]).not.toContain('--remote')}
 expect(pkg.scripts['db:remote:init']).toContain('sesonal-admin --remote')
 expect(pkg.scripts.build).not.toContain('db:remote:init')
 expect(readFileSync('scripts/set-admin-password.ps1','utf8')).toContain('seasonal-admin-local --env local --local')
 expect(readFileSync('playwright.landing.config.ts','utf8')).toContain('wrangler dev --env local --local')
})
