import { describe, expect, it } from 'vitest'
import { sceneCopy, decorationThemes, effectsAllowed,resolvePreference,animationLimit } from '../src/lib/seasonal/themes'
import {readFileSync,existsSync,readdirSync} from 'node:fs'
import {gzipSync} from 'node:zlib'

describe('seasonal presentation contract', () => {
  it('enables two events and limits concurrent motion', () => {
    expect(Object.entries(decorationThemes).filter(([, config]) => config.enabled).map(([theme]) => theme)).toEqual(['christmas','black-friday'])
    expect(animationLimit(true)).toBe(2)
    expect(animationLimit(false)).toBe(3)
  })
  it('honours the device by default but allows explicit override', () => {
    expect(effectsAllowed('auto',true)).toBe(false)
    expect(effectsAllowed('auto',false)).toBe(true)
    expect(effectsAllowed('on',true)).toBe(true)
    expect(effectsAllowed('off',false)).toBe(false)
    expect(resolvePreference(null,'off')).toBe('off')
    expect(resolvePreference(null,'on')).toBe('auto')
    expect(resolvePreference('on','off')).toBe('on')
    expect(resolvePreference('auto','off')).toBe('auto')
  })
  it('has usable localized effects/replay/reduced-motion copy for every locale', () => {
    for (const copy of Object.values(sceneCopy)) for (const text of Object.values(copy)) expect(text.length).toBeGreaterThan(3)
  })
  it('ships only self-contained light-player assets within per-file and event budgets',()=>{
    function inspect(value:unknown):void{
      if(!value||typeof value!=='object')return
      const record=value as Record<string,unknown>
      expect(typeof record.x).not.toBe('string')
      expect(typeof record.p).not.toBe('string')
      expect(record.ty).not.toBe(5)
      Object.values(record).forEach(inspect)
    }
    for(const event of ['christmas','black-friday'] as const){
      let total=0
      const motifs=new Set(Object.entries(decorationThemes[event].placements).filter(([placement])=>placement!=='header'&&placement!=='footer').map(([,item])=>item.motif))
      for(const motif of motifs){
        const file=`public/animations/${event}/${motif}`
        const json=readFileSync(`${file}.json`,'utf8')
        const bytes=gzipSync(json).length
        expect(bytes).toBeLessThanOrEqual(150*1024);total+=bytes
        expect(existsSync(`${file}.svg`)).toBe(true)
        if(motif==='tree'){expect(existsSync(`${file}.webp`)).toBe(true);expect(existsSync(`${file}-320.webp`)).toBe(true)}
        const data=JSON.parse(json) as {op:number;ip:number;fr:number;fonts?:unknown}
        expect(data.fonts).toBeUndefined();inspect(data)
        expect((data.op-data.ip)/data.fr).toBeGreaterThanOrEqual(6)
        expect((data.op-data.ip)/data.fr).toBeLessThanOrEqual(12)
      }
      expect(total).toBeLessThanOrEqual(500*1024)
      const allAssets=readdirSync(`public/animations/${event}`).reduce((sum,file)=>sum+gzipSync(readFileSync(`public/animations/${event}/${file}`)).length,0)
      expect(allAssets).toBeLessThanOrEqual(500*1024)
    }
  })
})
