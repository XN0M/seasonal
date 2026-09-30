export const policyPages = {
  editorial: { title:'Editorial policy', description:'How Seasonal Edit chooses and reviews gifts.', sections:[
    {heading:'Recipient fit comes first',body:'We organise ideas by recipient, interest, budget, event and retail market. A product must be useful for the intended recipient before any commercial relationship is considered.'},
    {heading:'What we verify',body:'Before a shoppable listing is published, we check product identity, image permission, merchant, destination, currency, price-check date and offer expiry. Children’s products require manufacturer age and safety information addressed to the adult buyer.'},
    {heading:'Sources and limits',body:'We use manufacturer documentation and merchant information. We identify hands-on testing only when it has actually taken place. Preview imagery and concepts do not represent named products or tested recommendations.'},
    {heading:'Corrections and review',body:'Prices and delivery conditions can change. The retailer confirms current terms at checkout. The production edition will include a contact method and review schedule before launch.'},
  ]},
  privacy: {title:'Privacy',description:'Data and measurement choices in this preview.',sections:[
    {heading:'This preview',body:'There is no account, checkout, email form or database. No analytics or advertising service is configured by default. The browser stores your measurement preference locally if you make a choice.'},
    {heading:'Optional measurement',body:'If configured, Google Analytics, Google Ads and Meta measurement load only after permission. You can reopen preferences from the footer and choose Essential only. Changing from allowed measurement to Essential only reloads the page to stop loaded scripts.'},
    {heading:'Affiliate links and retailers',body:'A retailer or affiliate network may process data after you follow a commercial link. Their privacy terms apply on their websites. The affiliate event on this site contains product, brand, merchant, market, locale, event, placement and tracking IDs, not names or email addresses.'},
    {heading:'Before production',body:'Hosting providers may process operational request logs. The operator’s identity, contact details, provider list, purposes and retention information must be completed and reviewed before public launch.'},
  ]},
  affiliate: {title:'Affiliate disclosure',description:'How commercial relationships are presented.',sections:[
    {heading:'How affiliate links work',body:'When active commercial links are introduced, we may earn a commission from qualifying purchases made through them. Purchasing takes place on the retailer’s website; this website does not take payments.'},
    {heading:'Clear labelling',body:'We identify commercial links near recommendations and mark outbound retailer links as sponsored. Relationships do not override recipient suitability, market eligibility or offer validity.'},
    {heading:'Preview status',body:'No affiliate link is currently active. Preview gift concepts have disabled commercial buttons and cannot generate affiliate clicks.'},
  ]},
} as const
