# Brand integration — operator guide

Historical initial integration. For the current site-wide permission/delivery policy and Brand Finder, use [site-wide operations](sitewide-brand-operations.md); shipping is no longer a condition for an approved brand-home link.

Local preview only, EN/DE/FR. Affiliate programmes were confirmed approved by the owner. Affiliate URLs and their attribution parameters are stored unchanged in `src/data/brands.ts`. No publishing or payout verification is implied by this integration.

## Initial evidence review — 2026-10-01

| Brand | Shopping enabled | Evidence and unresolved inputs |
|---|---|---|
| World of Cosmetics | GB | [Delivery policy](https://www.worldofcosmetics.co.uk/delivery/) explicitly UK only. Processing and transit are separate. |
| Cocon de Lune | FR | [France shipping policy](https://cocondelune.com/policies/shipping-policy). No assumption of UK/DE shipping. |
| SchenkDeinLied | DE | [German service site](https://schenkdeinlied.de/); no guarantee of its advertised completion time. |
| Gift for She | Pending | [Catalogue and FAQ](https://www.giftforshe.com/): personalised ornaments; GB/DE/FR not confirmed. Long custom-production lead time. |
| Be OVÉ | Pending | [Shipping policy](https://www.ove-collection.com/shipping-policy/): international statement, origin Ukraine and possible customs charges. No destination-specific confirmation for GB/DE/FR. |
| Cosmic Garb | Pending | [Catalogue](https://cosmicgarb.com/) and [FAQ](https://cosmicgarb.com/pages/faq); made-to-order clothing, sizing returns restricted. Market shipping policy not accessible. |
| Toybox | GB | [Official help centre](https://maketoys.zendesk.com/hc/en-gb/articles/360024561272-Can-I-buy-a-Toybox-outside-the-U-S) confirms US/CA/UK; [UK return terms](https://toybox.com/pages/uk-return-policy). Do not use similarly named toybox.shop as evidence for toybox.com. |
| Original Magic Art | Pending | [Current catalogue](https://www.originalmagicart.store/) includes playmats, tokens and prints. Current destination eligibility and in-stock/preorder status need confirmation. Original affiliate Shopify hostname is retained. |
| Blue Oasis | GB | [UK shop](https://uk.blueoasisfilter.com/) identifies UK shopping. Delivery policy inaccessible in this pass; no numeric delivery estimate or health claim is copied. |
| Batterie Externe Shop | Pending | [Catalogue](https://www.batterie-externe-shop.fr/); [linked delivery policy](https://www.batterie-externe-shop.fr/politique-de-livraison/) inaccessible in this pass. French storefront alone does not enable a market. |

Sources were read without following the owner's referral links or making purchases. A failed policy fetch means unverified, not unavailable or disreputable. All ten profiles are browsable in all three locales. Unsupported/unverified market CTAs are disabled with an explanation; eligible links are enabled without needing product photos. Translation is an authored preview, not certified human review.

## Routes and ordering

- Directory: `/{locale}/brands/`; filter `?category=beauty` (or any registry category). Other query parameters and back/forward are preserved. Without JavaScript, the complete directory remains available.
- Profile: `/{locale}/brands/{slug}/`; same slug in every language.
- `brandEventPriority` selects suitable brands and their order for Halloween, Black Friday and Christmas. Directory places market-eligible brands first. Event hubs show up to three eligible event-relevant brands; an event with fewer matches is not padded. Homepage replaces its existing four Women slots with beauty/self-care/fashion brands and its two Family slots with home/creative brands. These category groups use the same market/event ordering; unverified-market brands remain explorable but their shopping action is disabled. There is no duplicate standalone brand grid on the homepage.
- Change `src/data/campaign.ts`'s `activeEventId`, rebuild and verify the home/directory. Hub pages use their own event regardless of the active home campaign.
- Pause a link with `status: 'paused'`; pause a profile to remove its generated profile routes and cards. Rebuild and run link checks. Restore previous values to roll back.
- To enable a newly verified market, add destination-specific source/date/note to the profile's `marketChecks`. Link and merchant market arrays are derived from these entries. Confirm that approval also applies to the account and merchant destination.
- Source links are evidence, not product-shopping deep links. Featured image, title and CTA all use the original brand-home affiliate URL. No price/Offer schema is generated from these introductions.

## Official image intake — 2026-10-01 update

At the owner's request, twenty official catalog photographs/illustrations now cover all ten brands. The owner confirmed affiliate image-use permission in this chat; this is recorded permission evidence for local preview, not an independently inspected programme/artist licence. Altering an image does not confer usage rights. Originals and product lettering are preserved; responsive conversion does not crop or redraw packaging. Do not reuse epres attachments, unbranded concepts or stock images as merchant products.

Source URLs, download dates, dimensions and original SHA256 hashes are recorded in `docs/assets/brand-image-provenance.json`. The earlier catalog snapshot is historical research, not the current permission ledger. World of Cosmetics' [public affiliate page](https://www.worldofcosmetics.co.uk/influencers/) now refers to TradeTracker, while its [terms](https://www.worldofcosmetics.co.uk/terms-conditions/) require permission for commercial content use. Keep the supplied referral intact and confirm programme attribution/creative terms before public launch. Do not generalise platform participation into a universal image licence.

Toybox pictures are explicitly labelled EU-catalog examples: UK shipping eligibility does not prove that exact regional bundle is sold in the UK. SchenkDeinLied's single provider illustration represents a digital song service, not a physical SKU. Pending-market profiles show their real images without enabling shopping in an unverified destination.

The optional operator-only downloader uses public official-source GETs, exact HTTPS host/store-path allowlists, image MIME/size/format checks and exclusive creation of originals. It requires explicit owner confirmation:

```bash
node scripts/fetch-brand-images.mjs --owner-confirmed-affiliate-use
npm run images:brands
```

Downloading is not part of build or visitor runtime. A normal build is offline; originals/derivatives are self-hosted. Existing originals are not overwritten. Review changes and permission evidence before using this command for new records. `node scripts/brand-image-contact-sheet.mjs` creates an operator QA board.

## Additional image handoff

Ask for 3–6 product images per brand (1–2 are also supported). For each: exact brand/product name, source product URL and confirmation of permitted use. Optional actual logo files may be reviewed separately; text brand names remain the default.

Save user originals under `assets/originals/brands/`. Populate `assets/brand-images.json` with records shaped like this **documentation example, not a published product**:

```json
[
  {
    "id": "brand-product-slug",
    "brandId": "world-of-cosmetics",
    "originalFile": "world-of-cosmetics/product-slug.jpg",
    "name": {"en-gb":"Exact product name","de-de":"Exact product name","fr-fr":"Exact product name"},
    "description": {"en-gb":"Verified short description","de-de":"Geprüfte Beschreibung","fr-fr":"Description vérifiée"},
    "imageAlt": {"en-gb":"Describe this actual photo","de-de":"Dieses Foto beschreiben","fr-fr":"Décrire cette photo"},
    "sourceUrl": "https://www.worldofcosmetics.co.uk/product-source/",
    "sourceImageUrl": "https://www.worldofcosmetics.co.uk/wp-content/uploads/product-image.jpg",
    "permission": "Owner confirmation or merchant image-use permission and date"
  }
]
```

Use stable globally unique product IDs and one primary image per product. Supported inputs: JPG/JPEG, PNG, WebP, AVIF; animations and remote images are rejected. Keep a maximum of six featured products per brand in the intake. Source URL is for verification; it never replaces the shopping destination.

`npm run images:brands` preserves originals and generates AVIF/WebP widths with actual dimensions, without upscaling. `npm run build` runs this automatically. Outputs and `public/images/brands/manifest.json` are generated; do not hand-edit the output manifest. Unknown brand references, missing locale text and missing permissions fail validation. Cropping is not performed; thumbnails/gallery use contain.

For additional images, verify names, rights, alt text, all three outgoing links per gallery product, source references and four widths. Repeat photo-backed performance checks after catalog changes. The original text-only QA report is retained as history; current photo-backed results are in [official imagery QA](qa/official-brand-images-report.md).

## Verification

Run `npm test`, `npm run test:images`, `npm run build`, `npm run test:links`, `npm run test:e2e`. Product offers keep their existing expiry checks; brand links only have an expiry if explicitly supplied. Brand clicks contain `targetType: brand`, and featured clicks additionally contain `featuredProductId`. Internal introduction links never emit affiliate events. Existing consent gates apply unchanged.

Preview remains noindex. No tracker/account/backend/checkout or network commission dashboard is added. Commission attribution and orders are verified in GoAffPro/Refersion, not inferred from local click events.
