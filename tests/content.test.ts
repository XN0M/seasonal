import {describe,it,expect} from 'vitest'
import {readFileSync,readdirSync} from 'node:fs'
import {brandRegistry} from '@/data/brands'
const slugs=['age-appropriate-gifts','calm-black-friday','holiday-shopping-timing']
describe('localized guide completeness',()=>{
  it('keeps nine localized Markdown entries and full 500–800 word English masters',()=>{
    const files=readdirSync('src/content/guides',{recursive:true}).filter(name=>typeof name==='string'&&name.endsWith('.md'))
    expect(files).toHaveLength(9)
    for(const locale of ['en-gb','de-de','fr-fr'])for(const slug of slugs){
      const filename=`src/content/guides/${locale==='en-gb'?'':locale+'/'}${slug}.md`,text=readFileSync(filename,'utf8'),body=text.split('---')[2]!
      expect(text).toContain(`slug: ${slug}`);expect(text).toContain(`locale: ${locale}`);expect(text).toContain('status: review');expect(text).not.toContain('sources: []')
      const related=JSON.parse(text.match(/relatedBrandIds: (.+)/)![1]!) as string[]
      expect(related.every(id=>brandRegistry.profiles.some(profile=>profile.id===id))).toBe(true)
      expect(body.match(/^## /gm)?.length).toBeGreaterThanOrEqual(5)
      const words=body.trim().split(/\s+/).length
      expect(words).toBeGreaterThan(400)
      if(locale==='en-gb')expect(words).toBeLessThanOrEqual(800)
      if(locale==='en-gb')expect(words).toBeGreaterThanOrEqual(500)
      else expect(body).not.toContain('English master')
    }
  })
})
