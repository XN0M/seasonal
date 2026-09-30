import {describe,it,expect} from 'vitest'
import {commerceListSchema} from '@/lib/seo/commerce'
import {serialiseJsonLd} from '@/lib/seo/json'
import {products,offers} from '@/data/catalog'

const now=new Date('2026-09-30T12:00:00Z')
const card={product:{...products[0]!,status:'active' as const},brand:{id:'editorial-preview',name:'Test brand',status:'active' as const},merchant:{id:'preview-merchant',name:'Test merchant',status:'active' as const,markets:['GB' as const],allowedHosts:['merchant.example']},offer:{...offers[0]!,status:'active' as const,affiliateUrl:'https://merchant.example/item?ref=exact',trackingId:'test',price:35}}
describe('honest structured data',()=>{
  it('does not advertise preview or expired offers to search engines',()=>{
    expect(commerceListSchema([{product:products[0]!}],'en-gb','GB',now)).toBeUndefined()
    expect(commerceListSchema([{...card,offer:{...card.offer,expiresAt:'2020-01-01T00:00:00Z'}}],'en-gb','GB',now)).toBeUndefined()
  })
  it('includes a fresh verified price but never stale price markup',()=>{
    expect(JSON.stringify(commerceListSchema([card],'en-gb','GB',now))).toContain('"price":35')
    expect(JSON.stringify(commerceListSchema([{...card,offer:{...card.offer,verifiedAt:'2026-01-01T00:00:00Z'}}],'en-gb','GB',now))).not.toContain('"offers"')
    expect(commerceListSchema([card],'fr-fr','FR',now)).toBeUndefined()
  })
  it('escapes script terminators in JSON-LD',()=>expect(serialiseJsonLd({name:'</script><script>alert(1)</script>'})).not.toContain('</script>'))
})
