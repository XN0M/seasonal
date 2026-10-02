import {it,expect} from 'vitest'
import {readFileSync} from 'node:fs'
import {TestD1} from './helpers/d1'
import {seed} from '../worker/store'

it('upgrades a populated pre-custom database losslessly and seed does not resume paused/archived links',async()=>{
 const db=new TestD1(2)
 try{
  await seed(db)
  db.sql.exec("UPDATE redirect_links SET status='paused' WHERE slug='brand-toybox'; INSERT INTO redirect_links VALUES ('old-campaign','old-campaign','toybox','en-gb','GB',NULL,'email','Old campaign','archived',NULL,'{}',0,'2026-10-01T00:00:00Z'); INSERT INTO redirect_events VALUES ('old-event','2026-10-01T00:00:00Z','2026-10-01','old-campaign','toybox','Old campaign',NULL,'email',302,1); INSERT INTO redirect_daily VALUES ('2026-10-01','old-campaign','toybox','Old campaign',NULL,'email',302,7,5);")
  const oldLinks=db.sql.prepare('SELECT * FROM redirect_links ORDER BY id').all(),oldEvents=db.sql.prepare('SELECT * FROM redirect_events').all(),oldDaily=db.sql.prepare('SELECT * FROM redirect_daily').all(),oldDraft=db.sql.prepare('SELECT * FROM drafts').all()
  db.sql.exec(readFileSync(new URL('../migrations/0003_custom_redirects.sql',import.meta.url),'utf8'))
  await seed(db)
  const links=db.sql.prepare('SELECT * FROM redirect_links ORDER BY id').all()
  expect(links.map(({target_kind:_,destination_url:__,destination_hostname:___,...link})=>link)).toEqual(oldLinks)
  expect(links.every(link=>link.target_kind==='brand')).toBe(true)
  expect(db.sql.prepare('SELECT * FROM redirect_events').all()).toEqual(oldEvents)
  expect(db.sql.prepare('SELECT * FROM redirect_daily').all()).toEqual(oldDaily)
  expect(db.sql.prepare('SELECT * FROM drafts').all()).toEqual(oldDraft)
  expect(db.sql.prepare('PRAGMA foreign_key_check').all()).toEqual([])
  expect(()=>db.sql.prepare("UPDATE redirect_links SET status='active' WHERE id='old-campaign'").run()).toThrow('archived')
  expect(()=>db.sql.prepare("UPDATE redirect_links SET slug='changed-slug' WHERE id='old-campaign'").run()).toThrow('immutable')
 }finally{db.close()}
})
