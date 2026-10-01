# Brand affiliate integration — local QA, 2026-10-01

Historical text-only report. The owner subsequently changed image intake to official merchant sources and confirmed affiliate-use permission. See [photo-backed follow-up](official-brand-images-report.md); the original findings below describe the earlier build and are retained as history.

## Delivery and remaining gates

Ten profiles, exact owner-provided affiliate URLs, thirty EN/DE/FR introduction routes, category-filtered directory, two-destination cards and event-aware home/hub picks are implemented. Text-only preview is ready at `http://127.0.0.1:5180/en-gb/brands/`. No commit/push/deploy, public indexing, tracker or new market has been performed.

Shopping eligibility: GB — World of Cosmetics, Blue Oasis, Toybox; FR — Cocon de Lune; DE — SchenkDeinLied. Every other destination remains unverified, with a disabled Visit control and an accessible internal introduction. See [evidence/operator guide](../brands.md). Programme approval is owner-confirmed, not equivalent to shipping eligibility or tested commission attribution.

**Real imagery is not complete.** No photos for these brands were supplied. No concept image, artificial logo, placeholder product, price, rating or sale was substituted. BR-C01/C03 and photo-backed portions of BR-D02/D03 remain pending. Synthetic images exist only in temporary pipeline tests, never in the preview catalog.

## Build and automated verification

- Strict Astro build: 92 checked files, zero errors/warnings/hints, 90 generated Astro pages.
- Vitest: 33/33 meaningful tests across six files; exact ten URLs/referral values, market eligibility, event priority, invalid data, optional brand expiry versus mandatory offer expiry, featured payloads and 0/1/3/6-product resolver/schema fixtures.
- Image pipeline: 2/2 tests; all JPG/PNG/WebP/AVIF inputs, preserved original bytes, actual dimensions/no upscaling, duplicate/traversal/remote inputs and missing permission rejection. Initial Windows cleanup file-handle failure fixed by disabling Sharp's cache.
- Playwright Chromium: 46/46 desktop/mobile tests pass, no skipped or unexpected failures. Initial sandbox launch failures were infrastructure errors before page load; outside-sandbox browser execution succeeded. First full successful launch exposed two stale Black Friday assertions expecting no affiliate anchors; these now distinguish inactive concept links from the three real brand links. Final full run: 46 passes in 1.2 minutes.
- Local link/asset scanner: 92 HTML pages including asset credits, 5,434 references, no missing local asset/anchor, duplicate ID or indexable preview.
- Scoped Git whitespace check passes. CI/test:all now also run the image-pipeline tests; remote CI itself was not run.

Browser coverage includes exact same-tab referral destinations, one affiliate event per external click, no event for internal exploration, category URL/back/forward with campaign query preservation, market-gated links, no-JS links, localized axe, menu/Finder, consent, expired/inactive product fixture, reduced-motion/storage/error fallbacks and Christmas/Black Friday/Halloween lifecycle regressions. No external decoration request, unconfigured tracker or console/CSP violation observed in the tested pages.

## Responsive and visual review

Directory, UK profile and FR profile captured at 375/768/1024/1440px. No horizontal overflow >1px; brand CTA touch targets >=48px. Directory grid is 1/2/3 columns, no nested card link or autoplay carousel. Typography-only cards avoid empty image boxes. Separate shopping/exploration actions, unsupported-market explanations and disclosures reviewed in full-page captures.

References: `brands-directory-{width}.png`, `brands-profile-{width}.png`, `brands-fr-profile-{width}.png` in this folder. Existing seasonal screenshots were refreshed by regression tests; historical written reports are retained. Photo-backed gallery rendering/alt/packaging and actual 1/3/6-photo visual review still require owner assets; data-count tests are not claimed as that visual certification.

## Three-run Lighthouse mobile measurements

Same production build, sequential cold-profile lab runs, no concurrent browser suite. Homepage explicitly enables effects and verifies local Lottie JSON loading. Directory/profile decoration is intentionally static and uses device-default settings. A = Accessibility; BP = Best Practices.

| Page | Performance runs | A / BP | LCP runs (ms) | Median LCP (ms) | Maximum CLS |
|---|---|---|---|---|---|
| Halloween homepage, Effects on | 94 / 97 / 97 | 100 / 100 | 2718.099 / 2406.970 / 2408.406 | 2408.406 | 0.000035111 |
| Brands directory | 99 / 98 / 98 | 100 / 100 | 2032.564 / 2105.395 / 2104.028 | 2104.028 | 0.043413251 |
| World of Cosmetics, text-only profile | 99 / 99 / 99 | 100 / 100 | 2030.945 / 2027.879 / 2029.508 | 2029.508 | 0.000035111 |

All measured runs meet P>=90/A>=95/CLS<=0.1; each complete batch has median LCP<=2500ms. One homepage LCP exceeded 2500ms; median is the accepted gate, not an assertion about every individual LCP reading. Directory's progressively enabled filter accounts for a small layout shift; no image-related shift was measured because no real images are present. SEO66/63 is intentionally constrained by noindex and is not grounds to publish. TBT is not real-user INP.

Raw ignored audit summaries: `lighthouse-brands-home-mobile-summary.json`, `lighthouse-brands-directory-mobile-summary.json`, `lighthouse-brands-profile-mobile-summary.json`; individual runs retained alongside them. No photo-backed performance claim, physical-device certification, Firefox/WebKit verification or deployed-header/real-user result is made.

## Operator handoff

[Brand operator guide](../brands.md) documents data locations, original URLs, source checks, pausing/rollback, active-event priority, supported image intake and permission metadata. Add only owner-supplied authorised originals; run `npm run images:brands`, rebuild and re-test. Featured product image/title/button deliberately goes to the same brand-home affiliate URL, with a visible explanation; the source product URL is evidence, not the shopping destination. Do not add these products to Finder without genuine price/offer data.

No conversion/EPC or payout is inferred from local clicks. Confirm attribution in the affiliate network before traffic or public launch. Keep noindex and obtain human locale review before publication.
