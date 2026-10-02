import {DatabaseSync} from 'node:sqlite'
import {readFileSync} from 'node:fs'
import type {Database,Statement} from '../../worker/types'
export class TestD1 implements Database {
 readonly sql=new DatabaseSync(':memory:')
 constructor(migrationCount=3){for(const name of ['0001_admin.sql','0002_password_auth.sql','0003_custom_redirects.sql'].slice(0,migrationCount))this.sql.exec(readFileSync(new URL('../../migrations/'+name,import.meta.url),'utf8'))}
 prepare(query:string):Statement {
  const db=this.sql
  let parameters:unknown[]=[]
  const values=()=>parameters as (string|number|null)[]
  return {bind(...input){parameters=input;return this},async first<T>(){return (db.prepare(query).get(...values())??null) as T|null},async all<T>(){return {results:db.prepare(query).all(...values()) as T[]}},async run(){return {meta:{changes:Number(db.prepare(query).run(...values()).changes)}}}}
 }
 async batch<T=unknown>(statements:Statement[]):Promise<T[]> {
  this.sql.exec('BEGIN IMMEDIATE')
  try{const results=[];for(const statement of statements)results.push(await statement.run());this.sql.exec('COMMIT');return results as T[]}
  catch(error){this.sql.exec('ROLLBACK');throw error}
 }
 close(){this.sql.close()}
}
