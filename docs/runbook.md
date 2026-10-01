# Operating the preview

Current affiliate edition: [site-wide operations](sitewide-brand-operations.md). Ten owner-approved brand links are active across EN/DE/FR with separate delivery notes; older offer-engine instructions below do not gate these brand links. Latest verification: [site-wide QA](qa/sitewide-brand-report.md).

## Local development and verification

Use Node 24 and `npm ci` from this project directory. Dependency versions and the lockfile are pinned.

```sh
npm run dev                 # http://localhost:5178/en-gb/
npm run build               # TypeScript/Astro checks, then static dist/
npm test                    # pure commerce, events, finder and SEO rules
npm run test:links          # built local URLs, anchors, images/fonts, noindex
npx playwright install chromium
npm run test:e2e            # production preview on port 5180
npm run audit:mobile       # requires production preview running on 5180
```

`npm run test:all` builds and runs the unit, link and browser checks. Use `npx cross-env ASTRO_TELEMETRY_DISABLED=1 astro preview --host 127.0.0.1 --port 5180 --ignore-lock` for a separate foreground production preview (explicit CLI avoids duplicate port flags from the package script). Astro 7 otherwise uses its background server; stop only this project's server when needed, not unrelated Node processes.

## Content and commerce boundaries

### Switching the October preview / Halloween rollback

The event is selected explicitly in `src/data/campaign.ts`: `activeEventId = 'halloween-2026'`. This is editorial configuration, not a browser-clock/IP selection. EN/DE/FR share that choice; each event hub keeps its own theme. Finder filters never change the shell theme.

After 31 October 2026, change that one ID to `black-friday-2026` and rebuild **manually**. Use `holiday-2026` for Christmas or to return to the pre-Halloween main event. Unknown IDs intentionally fail the build. Do not remove old event records/assets or rewrite event URLs: customers can still plan Christmas/Black Friday early.

For either a switch or rollback:

1. Record the date, previous/new IDs, reason and validation results under the relevant `plan.md` phase. Preserve historical reports and unrelated changes.
2. Rebuild and run unit/link checks. Homepage-specific assertions/screenshots must be intentionally updated for the approved new active event; explicit Halloween/Christmas/Black Friday hub regressions must keep passing.
3. Verify all three homepage titles, hero art/alt, Current event navigation, Finder/interest shortcuts and empty states. Check Effects and reduced-motion on mobile. Keep noindex and offer eligibility unchanged.
4. Start local preview on 5180. Switching does **not** grant permission to deploy/push; public release remains a separate approval/gate.

Halloween has no product offers; its hub and event-filtered brand Finder currently select only World of Cosmetics. An incompatible recipient/category intersection stays empty and provides explicit filter-removal actions. All other seasonal events remain accessible. Homepage and Gifts use real brand cards, not concept product listings; event suitability is not a promotion or delivery promise.

Halloween sources/license: `docs/assets/provenance.md`, source archives in `docs/assets/source/`, public `animations/halloween/credits.html`. Reproduce JSON with `node scripts/prepare-halloween.mjs`, then posters with `node scripts/render-decoration-posters.mjs --halloween` (local Chromium required). Separate square/landscape original hero SVGs preserve existing frame sizes. All playback shares `src/lib/seasonal/client.ts`; do not install a second effects controller.

- `src/content/`: reviewed editorial Markdown, separate from commerce records.
- `src/data/catalog.ts`: the small preview catalog; `src/data/shop.ts` resolves eligible props.
- `src/lib/schemas.ts`: validates records and references during build. Never weaken this to make an invalid feed build.
- `src/lib/affiliate.ts`: authoritative commercial CTA and fresh-price rules.
- `src/lib/brand-finder.ts`: active UI contract, exact recipient/category/event filtering, country ordering/notices, legacy budget/category migration and native URL history. `src/lib/finder.ts` remains the separate product-offer price engine for fixtures/future verified offers.
- `src/lib/seo/commerce.ts`: no preview/expired Offer markup; no stale prices.
- Components receive validated commerce props. Affiliate URLs are not assembled or rewritten in UI components.

Before activating a merchant, supply its exact tracking hosts (including any approved affiliate-network redirect domain), markets, identity and active status. Subdomains are not automatically trusted. Before activating an offer, verify product/merchant IDs, market/currency, tracking ID, HTTPS URL, expiry and verification timestamp. Refresh volatile offers daily or more frequently; use short, verified expiry dates instead of assuming a holiday deal lasts all week.

Product images must be rights-cleared, accurate and processed into the same 320/640/960/1400 AVIF/WebP variants used by `MediaFrame`. `npm run images:optimise` currently processes only the four original editorial images, not merchant imagery. Never depict generated generic art as a branded SKU. Age/safety claims need manufacturer evidence. Concept records remain only in the separate product-offer engine/design-system fixtures, not customer shopping routes.

## Environment and consent

Copy `.env.example` to `.env`. `PUBLIC_*` values are embedded in the browser bundle and are not secrets. Optional `PUBLIC_SITE_URL` supplies the canonical origin; leaving it empty omits canonical/absolute OG links instead of inventing a domain. No remote fonts are requested.

`PUBLIC_GA_ID`, `PUBLIC_META_PIXEL_ID` and `PUBLIC_GOOGLE_ADS_ID` are optional. Default preview loads none of these SDKs. Configured services load only after persisted permission. Review the provider list, retention, operator identity, consent wording/versioning, regional requirements and CSP endpoints before activation. The supplied banner is a technical scaffold, not a legal compliance certification. Native-language policy copy is pending.

`affiliate_click` is a local browser event by default. Consent-enabled measurement can receive the same non-PII payload. This is not an order/conversion event: the affiliate network remains authoritative for transactions, reversals and commission. A server-side/cookie-light analytics destination and EPC dashboard are not connected.

## Cloudflare preview deployment

The static bundle has passed `npx wrangler deploy --dry-run`. Real deployment still requires your Cloudflare account authentication, project/account choice and access. No account or public URL has been created.

```sh
npx wrangler login
npm run deploy
```

Authenticate interactively yourself, or configure a narrowly scoped API token through environment/CI secrets. Never paste a token into source, `.env.example` or chat. Keep preview `noindex` in HTML, `robots.txt` and `_headers`. Validate HTTPS, actual response headers, asset caching and all locales after deployment; local Astro preview does not serve Cloudflare `_headers`.

`.github/workflows/quality.yml` assumes this directory is the repository root, as published to `XN0M/seasonal` on 2026-09-30. The hosted CI/scheduled-run results have not been verified. If later moved into a monorepo, move the workflow to the repository's `.github/workflows/` and configure working directories/cache paths first. Set `CF_PREVIEW_DEPLOY=true` only after supplying preview environment secrets and confirming the target account. Scheduling a build alone does not update the deployed website; the deployment job must also be enabled and successful.

## Rollback and maintenance

### Reproducing Halloween artwork

`node scripts/prepare-halloween-hero.mjs` builds the original three responsive SVG scenes from shared objects. `node scripts/prepare-halloween.mjs` adapts the retained licensed Lottie archives; `node scripts/render-decoration-posters.mjs --halloween` renders posters with local headless Chromium. Retain source/author/license records and disclose face/palette adaptations. Rebuild and rerun unit, responsive/Effects browser tests and fresh mobile performance after artwork changes. See `docs/qa/halloween-refinement-report.md` for the 1 October visual follow-up; older scores are historical, not certification for later images.

1. Retain the previous passing `dist` artifact and record its commit/version and preview URL.
2. For a bad feed/update, pause affected offers or revert only the relevant change, then rebuild, test and redeploy the previous verified artifact. Never reset unrelated work.
3. After rollback, smoke-test market switching, expiry gates, tracking payload and security headers on the actual deployed URL.
4. Weekly: dependency advisories, broken links and source/permission changes. Daily in event season: offer expiry, market eligibility, prices, delivery notes and deployment status. Record failures beside the matching task in `plan.md`.

## Public launch is a separate gate

The whole preview intentionally blocks indexing. Localised sitemap files are empty while every page is noindex. Setting `PUBLIC_SITE_URL` alone does not enable indexing. After approval, implement one central publication gate that jointly controls page metadata, HTTP headers, robots and reviewed sitemap entries; exclude drafts, unreviewed translations, design-system pages, thin brand pages and paid variants without independent value. No public release is approved by the current implementation.

Required inputs: official identity/domain/operator, at least 20 rights-cleared products, at least 10 verified offers per market, merchant approvals, reviewed DE/FR copy, sourced product/safety information and privacy review. Brand introductions, official catalog examples and three fully localized guides are implemented locally; field conversion, real shipping deadlines, human review and a real Halloween product catalog remain separate work. Halloween visual/event preview is implemented, not a market-ready catalog. Confirm site-wide acceptance on the deployed URL, collect RUM for INP, then soft-launch EN-GB before opening reviewed DE/FR.
