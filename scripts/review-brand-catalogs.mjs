import {mkdir,writeFile} from 'node:fs/promises'

// Operator-only source review; never called by the visitor or the site build.
// Public catalog metadata is evidence, not a licence to reproduce its images.
const sources=[
  ['world-of-cosmetics','https://www.worldofcosmetics.co.uk/wp-json/wc/store/v1/products?per_page=6'],
  ['gift-for-she','https://www.giftforshe.com/wp-json/wc/store/v1/products?per_page=4'],
  ['batterie-externe-shop','https://www.batterie-externe-shop.fr/wp-json/wc/store/v1/products?per_page=4'],
  ['cocon-de-lune','https://cocondelune.com/products.json?limit=8'],
  ['toybox','https://toybox.com/products.json?limit=5'],
  ['cosmic-garb','https://cosmicgarb.com/products.json?limit=8'],
  ['original-magic-art','https://www.originalmagicart.store/products.json?limit=4'],
  ['schenkdeinlied','https://schenkdeinlied.de/products.json?limit=4'],
  ['blue-oasis','https://uk.blueoasisfilter.com/'],
  ['be-ove','https://www.ove-collection.com/en/shop/'],
]
const results=await Promise.all(sources.map(async([brandId,sourceUrl])=>{
  try{
    const response=await fetch(sourceUrl,{signal:AbortSignal.timeout(25000)})
    if(!response.ok)throw new Error(`HTTP ${response.status}`)
    const body=await response.text()
    try{
      const data=JSON.parse(body)
      const products=Array.isArray(data)?data:data.products
      if(!Array.isArray(products))throw new Error('No product collection')
      return {brandId,sourceUrl,checkedAt:new Date().toISOString(),products:products.map(product=>({
        name:product.name||product.title,
        sourceUrl:product.permalink||`${new URL(sourceUrl).origin}/products/${product.handle}`,
        images:(product.images||[]).slice(0,3).map(image=>({url:image.src,alt:image.alt||image.name||'',width:image.width,height:image.height})),
        permissionStatus:'pending',
      }))}
    }catch{
      // HTML fallback records image/link evidence only, without assigning it to a SKU.
      const links=[...body.matchAll(/href=["']([^"']+)["']/g)].map(match=>match[1]).filter(url=>/product/i.test(url)).slice(0,20)
      const images=[...body.matchAll(/(?:src|data-src)=["']([^"']+\.(?:jpg|jpeg|png|webp)(?:[^"']*))["']/g)].map(match=>match[1]).slice(0,24)
      return {brandId,sourceUrl,checkedAt:new Date().toISOString(),title:body.match(/<title[^>]*>(.*?)<\/title>/s)?.[1],links,images,permissionStatus:'pending',needsProductMapping:true}
    }
  }catch(error){return {brandId,sourceUrl,error:error.message,permissionStatus:'pending'}}
}))
await mkdir('docs/research',{recursive:true})
await writeFile('docs/research/brand-catalog-snapshot.json',JSON.stringify(results,null,2)+'\n')
for(const result of results)console.log(JSON.stringify(result))
