import {it,expect} from 'vitest'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import {resolve} from 'node:path'
import {TestD1} from './helpers/d1'
it('operator helper receives stdin only, prepares salted hash and revokes credentials/sessions on import',async()=>{
 const fixture=resolve('.wrangler/password-reset-test-'+crypto.randomUUID()),script=resolve('scripts/admin-password.mjs')
 await mkdir(fixture,{recursive:true});await writeFile(resolve(fixture,'.dev.vars'),'OWNER_EMAIL=operator-fixture@example.invalid\n')
 const password='短'
 const result=spawnSync(process.execPath,[script],{cwd:fixture,input:JSON.stringify({password}),encoding:'utf8',windowsHide:true})
 expect(result.status,result.stderr).toBe(0);expect(result.stdout).not.toContain(password)
 const sql=await readFile(resolve(fixture,'.wrangler/tools/owner-password.sql'),'utf8')
 expect(sql).not.toContain(password);expect(sql).toContain('scrypt$16384$8$5$')
 expect(sql).not.toMatch(/^(?:BEGIN TRANSACTION|COMMIT);?$/m)
 const db=new TestD1()
 try{
  db.sql.exec(sql);expect((await db.prepare('SELECT version FROM admin_credentials').first<{version:number}>())?.version).toBe(1)
  await db.prepare('INSERT INTO admin_sessions VALUES (?,?,?,?)').bind('fixture-session',1,1,3601).run()
  const reset=spawnSync(process.execPath,[script],{cwd:fixture,input:JSON.stringify({password}),encoding:'utf8',windowsHide:true});expect(reset.status,reset.stderr).toBe(0)
  db.sql.exec(await readFile(resolve(fixture,'.wrangler/tools/owner-password.sql'),'utf8'));expect((await db.prepare('SELECT version FROM admin_credentials').first<{version:number}>())?.version).toBe(2)
  expect((await db.prepare('SELECT * FROM admin_sessions').all()).results).toHaveLength(0)
  expect((await db.prepare('SELECT * FROM audit').all()).results).toHaveLength(2)
 }finally{db.close()}
})
