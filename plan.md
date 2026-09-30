# Seasonal Event Affiliate Hub — Implementation tracker

Working name: **Seasonal Edit**. Preview policy: **noindex, no active affiliate links**.

Last verified: **2026-09-30**. **Local preview ready; public launch not ready.** Evidence: `docs/qa/report.md`; operations: `docs/runbook.md`. A checked task means its stated implementation is verified, not that all external phase gates are closed.

## Phase 0 — Brand and visual foundation

- [ ] P0-T01 — Finalise official name, domain and logo direction
  - Report: Blocked on final business decision. The UI uses “Seasonal Edit” as an explicitly temporary wordmark.
- [x] P0-T02 — Establish Modern European Editorial Commerce direction
  - Report (2026-09-30): Implemented paper/ink/moss/champagne/oxblood tokens, Newsreader + Manrope, compact 12-column-compatible layouts and four semantic seasonal themes.
- [x] P0-T03 — Create original preview imagery
  - Report (2026-09-30): Four built-in imagegen editorial assets retained in `assets/originals/`; responsive AVIF/WebP in `public/images/`. Duplicate public PNGs removed after hash comparison; originals retained. Briefs in `docs/image-prompts.md`. These are concept images, not SKU photos or product-test evidence.
- [ ] P0-T04 — Build GB/DE/FR merchant matrix and select 20 real products
  - Report: Pending authorised merchant/feed data. Six non-commercial concept records are used only to validate layout and filtering.
- [x] P0-T05 — Document desktop/mobile layout reference
  - Report (2026-09-30): Built homepage, event and Finder topology in `docs/wireframes.md`; screenshots in `docs/qa/`. No approved external Figma moodboard is claimed. Real 60/40 product/lifestyle ratio awaits actual product assets.

#### Phase completion report
- Status: Partial — preview foundation complete; commercial inputs intentionally blocked.
- Completed: Style direction, themes, responsive visual assets.
- Evidence/tests: Source assets in `public/images`; token implementation in `src/styles`.
- Visual review: Product-first layout and compact section rhythm implemented.
- Known issues: Official identity, merchant list, real image rights, 20 products and at least ten valid offers per market still required.
- Decisions/deviations: No fake logos, prices, ratings, stock or partner links.
- Next phase readiness: Ready for code foundation.

## Phase 1 — Code foundation and design system

- [x] P1-T01 — Initialise Astro, strict TypeScript, Tailwind v4 and React islands
  - Report (2026-09-30): Static Astro with strictest TS, pinned dependencies/lockfile and Workers assets config. Native menu/market selector remove header React hydration. React remains for Finder and configured consent UI. Build has zero errors/warnings/hints.
- [x] P1-T02 — Create folder architecture and self-host fonts
  - Report (2026-09-30): UI/commerce/editorial/interactive layers created; Newsreader and Manrope bundled locally.
- [x] P1-T03 — Build tokens, seasonal themes and primitives
  - Report (2026-09-30): Container, Stack, Cluster, SectionLabel, EditorialHeading, Button, IconButton, Tag, Price, MediaFrame and Disclosure; four-theme noindex `/design-system/`. Self-hosted italic/normal fonts, 48px controls and reduced-motion rules verified.
- [x] P1-T04 — Set locale routing and preview security defaults
  - Report (2026-09-30): EN-GB/DE-DE/FR-FR and root market selector; no IP redirect. Canonical/hreflang only with configured origin. CI quality/daily refresh and optional preview deployment supplied in `.github/workflows/quality.yml`, now published at repository root in `XN0M/seasonal`; hosted CI result not verified yet.
- [ ] P1-T05 — Enforce visual regression baselines
  - Report (2026-09-30): Four-width screenshots generated and reviewed, persistent 375/1440 references saved. Automated pixel-diff/cross-platform goldens not implemented yet.
- [x] P1-T06 — Publish project to the user-provided GitHub repository
  - Report (2026-09-30): Pushed initial implementation commit `0fb734a` to `https://github.com/XN0M/seasonal.git`, branch main tracking origin/main. Source, tests, images and documentation included; dependencies, build output, private environment files and runtime reports excluded. No force push; original remote was empty. This documentation update is a separate follow-up commit.

#### Phase completion report
- Status: Core foundation verified; CI connection and enforced visual regression remain pending.
- Completed: Project shell, design system, locale skeleton, deployment config.
- Evidence/tests: `astro.config.mjs`, `tsconfig.json`, `src/styles`, `public/_headers`.
- Visual review: 375/768/1024/1440 screenshots; four-theme axe passes. This is not certification of every future token pairing.
- Known issues: GitHub target is now `XN0M/seasonal`; first hosted CI result is not yet verified. Cloudflare credentials and opt-in deployment remain unconfigured.
- Decisions/deviations: Preview remains static and privacy-first.
- Next phase readiness: Ready.

## Phase 2 — Data and content engine

- [x] P2-T01 — Define typed commerce and event contracts
  - Report (2026-09-30): Added Product, Offer, Brand, Merchant, Market, Locale and SeasonalEvent contracts without `any`.
- [x] P2-T02 — Implement event-phase and offer validation
  - Report (2026-09-30): Central phase dates, HTTPS/exact-host/tracking/market/currency/status/ID/expiry rules; future/stale price checks. Real budget results use current market offer price rather than the concept band. Expired clicks also blocked client-side.
- [x] P2-T03 — Configure validated content collections
  - Report (2026-09-30): Event, guide and policy collections validate localized fields and review status at build time.

#### Phase completion report
- Status: Implemented with preview records.
- Completed: Data boundaries, resolver and content validation.
- Evidence/tests: 18 unit tests cover commerce, dates, Finder, references, localised routes and truthful JSON-LD.
- Visual review: Not applicable.
- Known issues: Live data/feed integration is deliberately deferred.
- Decisions/deviations: Preview offers are ineligible by design.
- Next phase readiness: Ready.

## Phase 3 — Core interface

- [x] P3-T01 — Build header, mobile menu, Event Hero and phase rail
  - Report (2026-09-30): Compact header, native modal menu, route-aware market selector, two-CTA hero, event-prefilled Finder and current-phase ARIA. Menu Escape/focus restoration, event anchor and 48px controls tested.
- [x] P3-T02 — Build commerce cards and homepage sections
  - Report (2026-09-30): Product/concept grids, women/family, budgets, upcoming events, guide cards, criteria, FAQ and policy destinations. Responsive art with contain/cover; preview badge limited to concepts; commercial disclosure beside active CTA.
- [x] P3-T03 — Build shareable Gift Finder
  - Report (2026-09-30): All five criteria: recipient, interest, budget, event and market. Normalised URL/history/UTM state, ARIA-pressed, reset and no-match guidance. Preview concepts are explicitly separate from eligible results; unknown/stale prices cannot match budgets.
- [x] P3-T04 — Build event, guide and brand routes
  - Report (2026-09-30): 57 routes/pages including event, recipient, real draft guides, policies and compact paid variants. Event budget shortcuts preserve event. Brand directory shows pending partnerships; no brand detail is falsely advertised.
- [ ] P3-T05 — Finish richer commercial event hub and brand details
  - Report (2026-09-30): Full inline category/recipient filters, sourced comparisons and BrandCard/OfferCard/ShippingDeadline variants remain pending. Budget links currently delegate to Finder. Brand page gate of three real products not met.

#### Phase completion report
- Status: Core local preview verified; complete catalog-driven commerce UI still pending.
- Completed: Core pages and interactions.
- Evidence/tests: 18 desktop/mobile E2E checks, axe and built-link/asset scanner.
- Visual review: Four target widths without horizontal overflow; persistent 375/1440 references reviewed.
- Known issues: Real catalog, richer inline filters/comparisons and campaign inputs absent. Paid variants are preview-only, not ready for ads.
- Decisions/deviations: Product cards show “partner link coming soon” instead of false CTAs.
- Next phase readiness: Ready for content replacement.

## Phase 4 — Content and localization

- [x] P4-T01 — Add English preview copy and localized UI shell
  - Report (2026-09-30): Localised primary shell/concepts and Black Friday/Christmas headline copy; three substantive English master guides, FAQ and policies. Several secondary sections and DE/FR article bodies remain English; full localisation is not claimed.
- [ ] P4-T02 — Human-review German and French commerce/editorial copy
  - Report: Pending native-language editorial review; all preview pages remain noindex.
- [ ] P4-T03 — Verify real image rights, product accuracy and sources
  - Report: Pending brand/merchant assets. Original preview imagery is safe for layout only.
- [x] P4-T04 — Metadata and conditional structured-data scaffolding
  - Report (2026-09-30): Article, Breadcrumb, FAQ and conditional ItemList/Offer helpers. Preview/expired offers produce no Offer; stale prices omitted. Optional origin controls canonical/hreflang/absolute OG; no made-up hostname. Preview sitemaps intentionally empty.
- [ ] P4-T05 — Complete sourced recipient/category/comparison content and Halloween beta
  - Report (2026-09-30): Recipient shells and budget shortcuts exist, but richer sourced content/Halloween event are not finished. Four visual themes do not mean four complete catalogs.

#### Phase completion report
- Status: Partial.
- Completed: Localized prototype content.
- Evidence/tests: All locales are generated at build.
- Visual review: Localised shell passes axe; human language review still pending.
- Known issues: Human review and real catalog absent.
- Decisions/deviations: No claims or ratings added without evidence.
- Next phase readiness: Can accept production content without UI rewrite.

## Phase 5 — Affiliate, analytics and consent

- [x] P5-T01 — Implement affiliate event contract and safe CTA gate
  - Report (2026-09-30): Sponsored/nofollow exact URL and same-tab payload tested using intercepted merchant fixture. Preview records cannot navigate or emit affiliate clicks; tracking URL parameters are not rewritten.
- [x] P5-T02 — Add privacy-first consent surface
  - Report (2026-09-30): GA/Ads/Meta SDK scaffold loads only after stored permission if configured. Preference/reset controls tested; zero SDK requests in unconfigured preview. Native default preferences avoid React overhead. Legal/regional/provider consent verification is not complete.
- [ ] P5-T03 — Connect analytics and affiliate dashboards
  - Report (2026-09-30): Local browser event only by default; cookie-light remote sink and EPC/conversion dashboard not connected. Need analytics IDs/provider/network decisions. Network remains authoritative for order/commission/refund data.

#### Phase completion report
- Status: Safe scaffold complete; external integrations pending.
- Completed: Event payload, gating, disclosure and consent UI.
- Evidence/tests: Unit and E2E assertions.
- Visual review: Consent is compact on desktop and mobile.
- Known issues: No reporting backend by V1 definition.
- Decisions/deviations: Zero trackers run in the unconfigured preview.
- Next phase readiness: Ready when credentials are provided.

## Phase 6 — QA, security and deployment

- [x] P6-T01 — Add CSP and baseline security headers
  - Report (2026-09-30): Hash-aware Astro CSP plus Workers frame/base/object protections, HSTS, nosniff, referrer and permissions policies. Fixed data-font CSP violation without relaxing font-src. Actual deployed headers still unverified.
- [x] P6-T02 — Add unit, E2E and accessibility test suites
  - Report (2026-09-30): Responsive AVIF/WebP pipeline, Vitest/Playwright/axe and built-link/asset/noindex checks. Dependency audit reports zero vulnerabilities.
- [x] P6-T03 — Verify local production build and target viewports
  - Report (2026-09-30): 57 pages, zero build diagnostics, 18 unit + 18 browser tests, 3318 local references pass after footer contrast correction. Latest Lighthouse mobile Performance 96 / Accessibility 100 / Best Practices 100; LCP 2565ms, CLS 0, TBT 0ms. Earlier LCP 2483.58ms; threshold not a stable pass yet. SEO 66 solely from required preview indexing block. INP and production SEO not verified. Evidence: `docs/qa/report.md`.
- [ ] P6-T05 — Deploy and verify Cloudflare preview
  - Report (2026-09-30): Static deployment dry-run succeeds (205 files at tested build). Real deployment blocked on missing Wrangler authentication. No live URL or response-header verification is claimed.
- [x] P6-T06 — Supply daily CI configuration and rollback runbook
  - Report (2026-09-30): Daily workflow and opt-in deploy configuration supplied; data/environment/deploy/rollback guide in `docs/runbook.md`. Schedule is not connected or live-rehearsed yet.
- [ ] P6-T04 — Remove preview launch blockers
  - Report (2026-09-30): Requires official identity/domain/operator, 20 sourced products, 10 eligible offers per market, real image permissions, DE/FR review, legal/consent and provider setup, live deployment/header/rollback QA, central publishing controls and approval to index. Do not remove noindex for a higher preview SEO score.

#### Phase completion report
- Status: Local preview verified; live deployment/public release incomplete.
- Completed: Build, QA, image pipeline, security scaffold, lab metrics, dry-run packaging and operating docs.
- Evidence/tests: `docs/qa/report.md`; 18 unit + 18 E2E tests; zero advisories at scan time. Latest lab result is one measurement, not a production guarantee.
- Visual review: Target widths reviewed; screenshots are references, not enforced pixel-diff tests.
- Known issues: Cloudflare authentication; public SEO/live headers/RUM/INP; catalog, translations and external services. Latest LCP exceeds target by 65ms; more margin and remeasurement on actual deployment/real assets are required.
- Decisions/deviations: Required noindex kept. SEO ≥95 not claimed; TBT is not used as an INP substitute.
- Next phase readiness: Ready for preview review, not soft launch.

## Phase 7 — Soft launch and optimisation

- [ ] P7-T01 — Soft launch EN-GB, then reviewed DE/FR
  - Report: Not started; Phase 6 launch gates remain.
- [ ] P7-T02 — Evaluate qualified clicks and scale by EPC/conversion
  - Report: Not started; requires live affiliate traffic.

#### Phase completion report
- Status: Not started.
- Completed: None.
- Evidence/tests: None.
- Visual review: None.
- Known issues: Dependent on production inputs and launch approval.
- Decisions/deviations: None.
- Next phase readiness: Not ready.
