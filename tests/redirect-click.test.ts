import {describe,it,expect} from 'vitest'
import {readAffiliateClick} from '../src/lib/analytics/affiliate-click'
const payload={targetType:'brand',brandId:'toybox',merchantId:'toybox-merchant',market:'DE',locale:'de-de',eventId:'holiday-2026',placement:'brand-card',trackingId:'9351560.b4e439',redirectId:'brand-toybox'}
const wrapper={origin:'https://seasonal.example',path:'/r/brand-toybox',affiliateUrl:'https://toybox.com/?rfsn=9351560.b4e439&utm_source=refersion&utm_medium=affiliate&utm_campaign=9351560.b4e439'}
describe('wrapped affiliate intent',()=>{
 it('accepts native same-origin wrapper and retains IDs without requiring fabricated expiry',()=>{expect(readAffiliateClick(JSON.stringify(payload),wrapper.origin+wrapper.path,undefined,Date.now(),wrapper)).toEqual(payload)})
 it('rejects mismatched origin, path, injected query, tracking and unexpected personal fields',()=>{
  for(const href of ['https://evil.invalid/r/brand-toybox',wrapper.origin+'/r/other-brand',wrapper.origin+wrapper.path+'?next=https://evil.invalid'])expect(readAffiliateClick(JSON.stringify(payload),href,undefined,Date.now(),wrapper)).toBeUndefined()
  expect(readAffiliateClick(JSON.stringify({...payload,email:'private@example.invalid'}),wrapper.origin+wrapper.path,undefined,Date.now(),wrapper)).toBeUndefined()
  expect(readAffiliateClick(JSON.stringify(payload),wrapper.origin+wrapper.path,undefined,Date.now(),{...wrapper,affiliateUrl:'https://toybox.com/?rfsn=wrong'})).toBeUndefined()
 })
})
