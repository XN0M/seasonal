# Seasonal Event Affiliate Hub — Implementation tracker

Working name: **Seasonal Edit**. Preview policy: **noindex, no active affiliate links**.

Last verified: **2026-10-01**. **Local preview ready; public launch not ready.** Latest Halloween evidence: `docs/qa/halloween-report.md`; historical foundation: `docs/qa/report.md`; operations: `docs/runbook.md`. A checked task means its stated implementation is verified, not that all external phase gates are closed.

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
  - Christmas follow-up (2026-09-30): Final local build zero diagnostics; 21 unit + 32 browser tests, 3775 references pass. Three final mobile runs: Performance 97, Accessibility/Best Practices 100, median LCP 2404.535ms, CLS 0. This resolves the local LCP gate for this preview build only. Evidence: `docs/qa/christmas-report.md`; public/RUM gates remain.
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
- Known issues: Cloudflare authentication; public SEO/live headers/RUM/INP; catalog, translations and external services. Baseline LCP exceeded target by 65ms; Christmas follow-up now meets the local three-run target, but actual deployment/real assets still require remeasurement.
- Decisions/deviations: Required noindex kept. SEO ≥95 not claimed; TBT is not used as an INP substitute.
- Next phase readiness: Ready for preview review, not soft launch.

## Christmas experience upgrade — approved 2026-09-30

Scope: Christmas first; controlled festive hero; existing colours, typography, spacing, commerce data, locales and noindex retained. No public deployment or GitHub push in this upgrade.

### Phase A — Shapes and foundation motion
- [x] CX-A01 — Centralise radius/easing/duration; soften cards, panels and controls
  - Report (2026-09-30): Tokens added; product 16px, editorial/panel 24px, pill controls. Grid columns, spacing and product fit unchanged. Astro strict build: zero errors/warnings/hints; responsive/axe checks pass in initial browser run.
- [x] CX-A02 — Refine menu/Finder feedback and remove purchasable-looking preview hover
  - Report (2026-09-30): 200ms controls, 250ms menu/Finder feedback, 300ms available-card motion (2px max); no preview-card/image zoom. Menu keyboard/focus, URL filters, FAQ and touch tests pass in initial browser run.

#### Phase completion report
- Status: Complete; final regression evidence in Phase C.
- Completed: CX-A01 and CX-A02.
- Evidence/tests: Strict build, 21 unit and 32 browser tests; responsive/menu/Finder/axe checks pass.
- Visual review: Rounded product grid and all four target viewports reviewed; focus/touch remain usable.
- Known issues: Initial Christmas inline-style CSP issue was isolated to Phase B and repaired without weakening policy.
- Decisions/deviations: Preserve grid density and section spacing.
- Next phase readiness: Christmas scene can be developed against the new tokens.

### Phase B — Christmas scene
- [x] CX-B01 — Typed theme configuration, original SVG tree/branches/ribbon/snow/Santa
  - Report (2026-09-30): Christmas-only SeasonalScene and typed theme registry; original SVG artwork; 12 desktop/6 mobile snow particles; transform-only 3s Santa flight. No third-party scripts or image/logo generation. Desktop hero image shortened by the controls' reserved height to retain the original footprint.
- [x] CX-B02 — Localised effects/replay controls, safe storage, reduced-motion and lifecycle pauses
  - Report (2026-09-30): EN/DE/FR pressed-state toggle and replay; local preference and once-per-session Santa; safe storage fallback and static no-JS. Load/viewport/visibility gates and live reduced-motion changes tested. CSP inline-attribute failure repaired with stylesheet presets/trusted CSSOM, no policy relaxation. 32 Chromium tests pass. Privacy copy documents the two functional display settings.

#### Phase completion report
- Status: Complete for Christmas preview.
- Completed: CX-B01 and CX-B02.
- Evidence/tests: 32 desktop/mobile Chromium tests; no browser/CSP/asset errors; localized axe and lifecycle tests pass.
- Visual review: 375/768/1024/1440 on/off heroes, Santa mid-flight and reduced-motion reviewed; motifs stay within the image and controls remain outside it.
- Known issues: With storage blocked, preferences last only for the current document; no-JS intentionally has no animation controls. Real-device/WebKit verification remains pending.
- Decisions/deviations: No third-party animation scripts, no moving decorations over commerce/text.
- Next phase readiness: Interaction/responsive verification completed in Phase C; ready for user preview review.

### Phase C — QA and preview handoff
- [x] CX-C01 — Unit/E2E/axe, links/assets/noindex and viewport screenshots (effects on/off)
  - Report (2026-09-30): Final strict build: 57 HTML pages, zero diagnostics. 21 Vitest + 32 Chromium desktop/mobile tests pass. 3775 local references pass; all preview HTML remains noindex. Eight tracked first-fold on/off references plus Santa/static/card screenshots reviewed at 375/768/1024/1440. Full-page captures remain in ignored test-results; no pixel-diff certification or physical-device claim. Evidence: docs/qa/christmas-report.md.
- [x] CX-C02 — Three mobile Lighthouse runs and performance adjustments
  - Report (2026-09-30): First batch median LCP 2564.35ms; adjusted initial control-space reservation and mobile padding, and inlined small styles with Astro CSP hashes. Final batch 11:19 UTC: all three Performance 97 / Accessibility 100 / Best Practices 100 / SEO 66; LCP 2404.54/2403.56/2404.54ms, median 2404.535ms, CLS 0 in all runs, TBT 10/21/14ms. All upgrade lab thresholds pass. SEO remains intentionally limited by noindex; TBT is not field INP.

#### Phase completion report
- Status: Complete for local Christmas preview.
- Completed: CX-C01 and CX-C02.
- Evidence/tests: docs/qa/christmas-report.md; 21 unit + 32 browser tests; final three-run Lighthouse summary, build/link scanner and git diff whitespace check pass.
- Visual review: All four widths on/off, rounded cards, Santa and static reduced-motion scene reviewed. No extra sections; hero controls accommodated within the original default-motion footprint.
- Known issues: Physical-device/Firefox/WebKit, field INP and production performance remain unverified; production launch blockers are unchanged.
- Decisions/deviations: Preserve noindex and inactive commerce. Inline built styles instead of adding an animation library; no unsafe-inline CSP change. No deploy/commit/push. Conversion evaluation waits for real offers/traffic.
- Next phase readiness: Preview review only; other seasonal scenes and Thanksgiving remain out of scope.

## Seasonal backgrounds and Lottie decoration — approved 2026-09-30

Scope: Christmas + Black Friday, EN/DE/FR; six homepage placements, four event-hub placements; unchanged commerce/layout, noindex, local preview only. Supersedes the hero-only scene; historical Christmas reports above are preserved.

### Phase A — Assets and visual composition
- [x] DEC-A01 — Obtain and validate licensed vector Lottie assets; record provenance and size
  - Report (2026-09-30): Four licensed motifs by JAStudio, KaramAhn, Mahmud Hasan and Anwar Khan; source archives outside public output, source/author/license records in docs/assets/provenance.md and public/animations/credits.html. Six adapted JSON files; no external images/fonts/expressions, no Premium/account requirement or placeholder. Gzip totals Christmas 31,351B / Black Friday 7,266B; each JSON under 150KB and each event under 500KB. Safety/budget unit test passes.
- [x] DEC-A02 — Lock desktop/mobile safe placement and consistent colour adaptations
  - Report (2026-09-30): Shared flat-vector, fir/champagne/oxblood palette; four source authors adapted consistently. Six home / four event positions, static shell on editorial pages. Geometry check passes at 375/768/1024/1440 with no intersection over visible headings, paragraphs, links, buttons, selectors or product cards. Small ornaments shrink to existing padding bands rather than enlarging sections. Native header/footer motifs are original SVG, not downloaded placeholders.
- [x] DEC-A03 — Background tokens and static posters for both events
  - Report (2026-09-30): Christmas #FAF8F3 with ice-edge ambience; Black Friday #F3EEE4 with dark green/champagne ambience. Six local SVG posters rendered at 55%; docs/qa/decoration-assets.png reviewed. Mature-tree segment avoids blank-pot intro. No fake sale label, logo, money or claim added.
#### Phase completion report
- Status: Complete.
- Completed: DEC-A01–A03.
- Evidence/tests: 22 unit tests; asset board and four-width geometry/screenshots.
- Visual review: Coherent vector palette and two event backgrounds; safe positions reviewed.
- Known issues: No asset blocker; physical-device/production performance remains to be measured separately.
- Decisions/deviations: Multiple free authors adapted; original header/footer SVG avoids incompatible downloaded confetti/expressions. Small ornaments are reduced where the existing padding cannot fit 72–96px, preserving layout. SVG light player, no external runtime requests.
- Next phase readiness: Assets ready for integration.

### Phase B — Integration and control
- [x] DEC-B01 — Typed configuration, reusable decoration and shared playback controller
  - Report (2026-09-30): SeasonalDecorationConfig/themes, reusable SeasonalDecoration and light-player type declaration; one lazy controller with cloned/cached local JSON, load/visibility/proximity gates, 3/2 motion budgets, header one-shot and static/error posters. No React island added. Unit and viewport/tab/failed-asset browser tests pass.
- [x] DEC-B02 — Homepage/event/page-shell integration; replace old scene without duplicating effects
  - Report (2026-09-30): Six home, four event, two Finder points; guide/brand/policy shell static. SiteLayout, home/event pages and SeasonalScene integrated. Removed the old hero-only tree/branches; original snow/Santa now use the common controller. Existing grid/spacing/media-fit retained; Black Friday has no empty Santa control space. Safe-zone/overflow checks pass.
- [x] DEC-B03 — Effects preference, explicit reduced-motion override and Santa replay
  - Report (2026-09-30): EN/DE/FR Effects in desktop header/mobile menu, accessible state/description and localized device-override notice; auto/on/off preference with safe migration/storage fallback. Old off retained; old on not treated as override. Christmas off-state explains replay with Enable effects; three-second, once-per-session Santa and manual replay pass keyboard/reduced-motion/persistence tests. Non-decoration UI remains reduced-motion.
#### Phase completion report
- Status: Complete; final regression/audits tracked in Phase C.
- Completed: DEC-B01–B03.
- Evidence/tests: 22 unit tests; interaction/lifecycle/storage/axe regressions and target-width safe-zone checks pass. Source: src/lib/seasonal/, SeasonalDecoration, SeasonalScene, EffectsControl and seasonal.css.
- Visual review: Christmas and Black Friday hero/background plus full-page references reviewed; images decoded before captures.
- Known issues: Full screenshot-batch test initially exceeded its 60s high-DPR artifact timeout; CSS-pixel capture removed that overhead (final mobile batch 10.1s), with a bounded 120s artifact-batch limit. No remaining local functional blocker; production gates remain separate.
- Decisions/deviations: No new market, route, commercial claim or tracker; no CSP relaxation. Storage-blocked settings last only for the current document. Native header/footer SVG and Lottie motifs share palette/controller.
- Next phase readiness: Ready for final QA and three-run performance measurement.

### Phase C — Verification and preview handoff
- [x] DEC-C01 — Unit, browser, axe, asset/link and CSP verification
  - Report (2026-09-30): Final strict build checks 72 files with zero diagnostics; 57 Astro pages. 22 unit + 30 desktop/mobile E2E tests pass, zero skipped/flaky/unexpected. Scanner: 58 HTML pages including credits / 3,860 references, all noindex, no missing assets/anchors or duplicate IDs. Browser/CSP/console checks and exact affiliate fixture/expired/inactive commerce regressions pass; no external decoration request. Production npm audit: zero advisories. Source/asset budgets and whitespace checks pass. Evidence: docs/qa/decorations-report.md.
- [x] DEC-C02 — Two events × four widths × effects on/off screenshots and visual review
  - Report (2026-09-30): Sixteen first-fold on/off references, two decoded full-page captures, responsive and asset boards in docs/qa/ reviewed at 375/768/1024/1440. Safe-zone and overflow assertions pass; no grid/spacing change or product overlay. Additional DE/FR reduced-motion-on diagnostics at 375px pass axe/overflow and fit the original 54px controls, with localized screenshots. Images eagerly primed only in test pages; production lazy loading retained. Header focus outlines layered above decoration. CSS-pixel screenshots avoid high-DPR artifact timeout; no physical-device or pixel-diff certification claimed.
- [x] DEC-C03 — Three-run mobile Lighthouse for Christmas home and Black Friday hub
  - Report (2026-09-30): Device-default runs alone missed active-Lottie cost, so added explicit-on/cold-cache audit with verified JSON fetch. Initial on median Christmas 2936.757ms (one P88), BF 2714.216ms. Responsive tree WebP posters and paint/idle scheduling repaired budgets. Final three-run Christmas P95/97/97, A100/BP100, median LCP2479.646ms; BF P97/95/97, A100/BP100, median 2406.354ms. CLS0.0000351 in all final runs; every specified lab gate passes. Individual LCP runs can exceed 2.5s; acceptance uses median. SEO66 intentionally noindex; TBT not field INP. Evidence: docs/qa/decorations-report.md and labeled audit summaries.
#### Phase completion report
- Status: Complete for local preview.
- Completed: DEC-C01–C03.
- Evidence/tests: docs/qa/decorations-report.md; 22 unit / 30 E2E tests, strict build, 3,860 link/asset references, production audit and both three-run active-motion Lighthouse batches pass.
- Visual review: Two event backgrounds, four responsive widths on/off, full-page commerce, static posters, six/four/two placements and focus-safe header reviewed.
- Known issues: Physical-device/Firefox/WebKit, deployed headers, field INP and production performance unverified. Real identity/catalog/merchant offers/translations/services remain original launch blockers. Storage blocked: preferences/Santa memory are document-local.
- Decisions/deviations: Keep noindex; no deploy/commit/push. Multiple free authors palette-adapted; native header/footer motifs; small ornaments shrink to existing padding. Tree poster rasterised responsively, player deferred to idle. Snow stays in the hero safe zone; outer-edge ambience is static to preserve movement/performance budgets. No commerce or tracker change.
- Next phase readiness: Ready for local user review; not public launch or paid traffic.

## Halloween background and decoration — 2026-10-01

Scope: Halloween as the October preview event on EN/DE/FR; dark outer background/hero and light content surfaces. Preserve layout, commerce, existing Christmas/Black Friday routes, Effects preferences and noindex. Local preview only; no push/deploy. Every task gets evidence immediately on completion; retain all historical reports above.

### Phase A — Event foundation and composition
- [x] HW-A01 — Halloween event, localized copy/phase labels and explicit active-event ID
  - Report (2026-10-01): Added halloween-2026, three localized event routes/copy, local-time 31 October dates and non-commercial preparation phases; src/data/campaign.ts selects the preview by ID, not array order or browser time. Existing Christmas/Black Friday and commerce data preserved. Strict build: zero diagnostics; 23 unit tests pass, including three-market dates/phase boundaries; localized browser/axe content tests pass in the running QA batch.
- [x] HW-A02 — Licensed pumpkin/ghost assets, validation and provenance
  - Report (2026-10-01): Obtained public free Lottie archives by Midhun Mohan and Alex Bradt; reused Mahmud Hasan stars. Provenance/license/source archives recorded. Adapted palette, removed the ghost's grave/word art/heart and cropped to the friendly character. Replaced pumpkin's wide source choreography with a seamless 10s vertical float (<8px at 240px width), continuously visible cluster and frozen internal transforms. SVG light-player posters rendered successfully; validation rejects expressions/fonts/images/external resources. Final JSON gzip sizes: pumpkin 1899B, ghost 5971B, star 766B (8636B total); no Premium/placeholder or asset blocker. Reproducible scripts/prepare-halloween.mjs; asset board reviewed.
- [x] HW-A03 — Static posters, original Halloween hero and six-position responsive composition
  - Report (2026-10-01): Original square/landscape Halloween SVG hero and three local posters; six placements preserve existing wrappers, columns and padding. Reviewed 375/768/1024/1440 on/off and DE/FR opt-in references. Visual review caught scoped muted-text overriding dark-hero colour and square art cropping on mobile; fixed with hero-region tokens and a media-selected landscape SVG, without increasing frame height. Shortened localized headlines to avoid unnecessary wrapping. Axe plus computed-colour contrast against the brightest hero gradient stop pass; safe-zone/overflow tests pass.
#### Phase completion report
- Status: Complete for preview.
- Completed: HW-A01–A03.
- Evidence/tests: Strict build, 23 unit tests, 36 browser tests; provenance and responsive/asset references in docs/qa/.
- Visual review: Friendly pumpkin/ghost/star palette, dark hero and light commerce surfaces; no Christmas hero art or grave/lettering in ghost.
- Known issues: No asset blocker; real Halloween catalog and native-language editorial review remain outside this visual upgrade.
- Decisions/deviations: Two free source authors plus reused stars; original vector hero has separate mobile art direction. Tiny native header webs fit existing safe strip; no placeholder or fabricated offer.
- Next phase readiness: Asset/event contracts ready for integration.

### Phase B — Integration
- [x] HW-B01 — Extend existing motif/config/controller and scoped backgrounds
  - Report (2026-10-01): Enabled typed Halloween placements (web/pumpkin/ghost/star), reusing existing light player, proximity/visibility/idle lifecycle and 3/2 concurrent budget. Background/hero/content tokens are scoped in seasonal.css; only hero colour tokens become light, commerce ink stays unchanged. No new React island, dependency, tracker or CSP exception. Budget, lifecycle and error tests pass.
- [x] HW-B02 — Homepage/event/page-shell integration and event-prefilled navigation/Finder
  - Report (2026-10-01): Halloween homepage/current-event/metadata/alt/shortcuts on EN/DE/FR; six home, four hub, two Finder and static editorial shell placements. All homepage Finder/budget shortcuts carry halloween-2026. No matching Halloween products: hub and filtered Finder show localized honest empty states and links to Christmas/Black Friday; homepage concepts explicitly say they are not Halloween recommendations. Products/offers untouched. No Halloween paid variant generated without a catalog.
- [x] HW-B03 — Effects, fallback/empty states and no Santa/snow in Halloween
  - Report (2026-10-01): Retained auto/on/off migration and saved off; explicit reduced-motion opt-in works via mouse/keyboard/mobile menu without enabling UI transitions. Off stops decoration; storage/asset failure and no-JS retain posters/content. Halloween has no Santa/snow/replay/control spacer. Christmas once-per-session Santa/replay and Black Friday tests now target their explicit routes, not an assumed Christmas homepage; regressions pass.
#### Phase completion report
- Status: Complete; final performance/handoff in Phase C.
- Completed: HW-B01–B03.
- Evidence/tests: 36 Chromium desktop/mobile E2E tests, localized axe, computed gradient contrast, concurrency/lifecycle and affiliate fixture regressions pass.
- Visual review: Four-width safe zones; no protected heading/CTA/price/card intersections or overflow; static/error decorations do not alter shopping controls.
- Known issues: Storage blocked means preference lasts in the current document; physical devices/other engines remain unverified.
- Decisions/deviations: Shared player/controller, no React decoration island or CSP relaxation.
- Next phase readiness: Ready for final build/link checks and three-run active-effects Lighthouse batches.

### Phase C — QA and local preview handoff
- [x] HW-C01 — Build/unit/E2E/axe/assets/links/noindex/CSP and existing-event regressions
  - Report (2026-10-01): Strict build: 76 checked files, zero errors/warnings/hints, 60 Astro pages. 24 unit + 36 desktop/mobile Chromium tests pass; no skipped/flaky cases. Scanner: 62 HTML pages including credit pages / 4057 local references, no missing anchors/assets/duplicate IDs; preview noindex intact. Localized axe/computed gradient contrast, menu/Finder/history, exact same-tab affiliate fixture, failed-asset/storage/no-JS, pause/lifecycle/budget and Christmas/Black Friday regressions pass. No console/CSP or external-decoration request; whitespace check passes.
- [x] HW-C02 — 375/768/1024/1440 on/off screenshots and EN/DE/FR reduced-motion review
  - Report (2026-10-01): Sixteen home/hub on/off first-fold references, decoded home full page, three locale reduced-motion opt-in captures and asset board saved in docs/qa/. All four widths reviewed; no overflow or protected-content collision. Tablet 768px cropping caught at final visual review; original Halloween hero uses contain on night backdrop at 501–780px, retaining its existing 160px frame. Fixed scoped MediaFrame override and added computed-fit assertion; final 36/36 browser tests pass (54s). Smartphone/desktop and product image fit unchanged; no physical-device or pixel-diff certification claimed.
- [x] HW-C03 — Three active-effects mobile Lighthouse runs each for Halloween home/hub
  - Report (2026-10-01): Cold-cache explicit-on batches verify local Lottie JSON loading. Initial P71 outlier and intermediate home median LCP2643.6892ms / hub P89/78 outliers retained, not accepted. Simplified pumpkin choreography, instantiate only visible/selected players, native Halloween FPS, low-priority non-hero images; hub secondary event-info ghost made static without removing its placement. Final home P97/97/97, A100/BP100, median LCP2425.5041ms. Hub incomplete batch P97/98 ended in tool ConnectionClosedError; complete retry P90/97/98, A100/BP100, median LCP2330.3542ms. CLS<=0.0000351108 throughout final batches. All specified local gates pass; SEO66 intentionally noindex, TBT is not INP. Raw summaries and full measurements/failed attempts documented in docs/qa/halloween-report.md.
- [x] HW-C04 — QA report, explicit event switch/rollback instructions and preview handoff
  - Report (2026-10-01): docs/qa/halloween-report.md contains source/asset evidence, screenshots, every rejected/incomplete/accepted audit batch, final metrics and known limits. README and docs/runbook.md document activeEventId, manual Black Friday switch after 31 October, rollback to holiday-2026, rebuild/verification and preservation of old routes/assets. Preview served on 127.0.0.1:5180; mobile Effects is in the menu. Final strict build and 4057-reference scanner pass; no push, commit or deployment, noindex unchanged. Existing commercial/translation/production launch blockers remain.
#### Phase completion report
- Status: Complete for local Halloween preview; public launch not approved.
- Completed: HW-C01–C04.
- Evidence/tests: docs/qa/halloween-report.md; 24 unit / 36 browser tests, strict build zero diagnostics, 4057 local references, final three-run home/hub lab gates and whitespace check pass.
- Visual review: Home/hub at four widths on/off, whole-page commerce, three locale opt-in states and asset board reviewed. No increased section height or grid/spacing change; hero art fits smartphone/tablet/desktop.
- Known issues: No live Halloween catalog, public identity, human translation review or production certification added. Lab CPU/score variation recorded; physical-device/Firefox/WebKit, real-user INP and deployed headers/performance remain unverified. Storage-blocked settings are document-local.
- Decisions/deviations: Hub secondary event-info ghost static per approved performance fallback; all four points remain. Halloween timings simplified/native FPS; non-hero images low priority. After October, switch configured event to Black Friday and rebuild manually; no scheduler/runtime clock switch. No push/deploy; keep noindex.
- Next phase readiness: Ready for user local preview review, not public launch or paid traffic.

## Halloween visual refinement — 2026-10-01

User review found the first illustration unfinished: merged pumpkin silhouettes, duplicate moons, disconnected gift and tablet negative space. This follow-up preserves the earlier implementation/test history, layout, commerce and preview noindex.

- [x] HVR-01 — Restore pumpkin detail and build a unified, original Halloween still-life
  - Report (2026-10-01): Fixed palette adaptation which had erased ribs/face/leaf contrast. Licensed pumpkin body retained; source teeth/diamond eyes replaced with original round eyes and a curved smile; cropped composition keeps stems visible, ten-second float reduced to 45 source units. Added reproducible scripts/prepare-halloween-hero.mjs: shared detailed kraft gift, layered ribbon/tag, plum parcel, shaded gourd, autumn foliage, ground/shadows and one crescent. SVGs 7829/7893/7987B raw; no image/font/filter/script dependency. Updated licensed notices and asset board; 25 unit tests pass, including tonal contrast and hero safety/budget assertions.
- [x] HVR-02 — Art-direct phone/tablet/desktop without changing frame height or interaction
  - Report (2026-10-01): MediaFrame now accepts an optional tablet art source; shared picture component uses phone <=500px, tablet 501–780px, desktop >780px, all cover without distortion. Removed tiny-centre contain workaround and duplicate hero moon. Pumpkin sits near the stage, with mobile/tablet maximum width 210px; phone still gourd moved clear of the seal. Preserved frame/section height, grid, six/four/two placements, controller/concurrency/Effects and unchanged commerce. Both full 36-test browser regressions passed; final four-width containment and screenshots reviewed.
- [x] HVR-03 — Responsive visual review, regression tests and performance verification
  - Report (2026-10-01): Strict build 77 files/zero diagnostics/60 Astro pages; 25 unit and final 36 desktop/mobile Chromium E2E tests pass. EN/DE/FR axe, four-width on/off screenshots, hero containment/safe zones, reduced-motion, lifecycle, fallback, Finder/affiliate and Christmas/Black Friday regression pass; scanner 4063 local references pass. Fresh explicit-on/cold-cache Lighthouse: initial home P89/97/97 (one gate miss retained); hub P97/96/95 median LCP2405.2972ms; same-build home repeat P97/97/97 median LCP2407.0668ms. A100/BP100 all nine, CLS0.0000351108. Final complete batches pass, but no claim that every observed run meets P90. Evidence and all attempts in docs/qa/halloween-refinement-report.md; user visual approval remains pending. No push/deployment, preview noindex retained.

#### Visual refinement completion report
- Status: Implementation/QA complete for local preview; awaiting subjective user approval, not production launch.
- Completed: HVR-01–03.
- Evidence/tests: docs/qa/halloween-refinement-report.md; build zero diagnostics, 25 unit/36 browser tests, 4063 local links, refreshed screenshot evidence and all nine fresh lab readings.
- Visual review: Round-eyed pumpkins with restored ribs/leaves, detailed shared gift still-life, one crescent; tablet no longer has tiny central art or clipped stem; phone gourd clear of seal. Same frame heights/spacing/grid and shopping safe zones.
- Known issues: Initial home P89 lab reading retained; repeated home and complete hub batches meet target without a claim of universal performance. Physical-device/other-engine/RUM and existing catalog/translation/production blockers remain.
- Decisions/deviations: Refine original vector art and licensed vector colours/face rather than add disconnected moving motifs or a new animation system. No UI motion/control/data/market/tracker changes.
- Next phase readiness: User can review updated local preview; no public push/deployment approved.

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
