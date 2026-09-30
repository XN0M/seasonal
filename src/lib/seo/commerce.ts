import type {CommerceCard} from '../commerce'
import type {Locale,Market} from '../types'
import {isFreshPrice,offerValidation} from '../affiliate'

export function commerceListSchema(cards:CommerceCard[],locale:Locale,market:Market,now=new Date()):Record<string,unknown>|undefined {
  const eligible=cards.filter(({product,offer,brand,merchant})=>offer&&brand&&merchant&&offerValidation(offer,product,merchant,now,brand,market).valid)
  if(!eligible.length)return undefined
  return {
    '@context':'https://schema.org','@type':'ItemList',
    itemListElement:eligible.map(({product,offer,brand,merchant},index)=>({
      '@type':'ListItem',position:index+1,
      item:{'@type':'Product',name:product.name[locale],description:product.why[locale],brand:{'@type':'Brand',name:brand!.name},
        ...(isFreshPrice(offer!,now)&&offer!.price!==undefined?{offers:{'@type':'Offer',price:offer!.salePrice??offer!.price,priceCurrency:offer!.currency,url:offer!.affiliateUrl,priceValidUntil:offer!.expiresAt.slice(0,10),seller:{'@type':'Organization',name:merchant!.name}}}:{}),
      },
    })),
  }
}
