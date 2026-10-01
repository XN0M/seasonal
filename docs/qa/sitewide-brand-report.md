# Site-wide brand affiliate completion — 2026-10-01

## Outcome and scope

Local EN/DE/FR edition complete. All ten owner-approved brand-home affiliate links retain their original domain, ref/rfsn and UTM. Programme permission and image-use permission are owner-confirmed; delivery evidence remains separate. Unknown delivery does not lock a valid link; sourced restrictions and digital-service context remain visible before shopping CTAs.

Homepage retains four Women/two Family photo-backed slots. Gifts, event hubs and campaign landings use real recipient/event-appropriate brands, not concept product offers. Guides/policies/navigation remain internal; related examples and shopping CTAs use the disclosed brand-home URL. Twenty existing official catalog images and original hashes are retained. No invented price, stock, rating, sale, SKU deep link or age guarantee.

Finder has recipient, eight interests, event and country criteria. It preserves UTM/hash and browser history, migrates budget/category URLs, does not silently relax empty filters, and keeps ten native links without JavaScript. Native JavaScript now controls server-rendered cards; the initial React hydration experiment was replaced to meet the performance gate without delaying interaction. Offer validation remains independent. The rest of the Astro/TypeScript/Tailwind/React stack and seasonal decoration controller are retained.

Nine Markdown guide bodies have sources, updated dates, calculated reading times and related brands. English bodies are 601/649/662 words; DE/FR have full authored bodies rather than an English fallback. Native-language/legal review remains pending and is not claimed.

## Final verification

| Check | Result |
|---|---|
| Astro static build | 90 pages; successful |
| Strict Astro/TypeScript | 102 files, zero errors/warnings/hints |
| Unit suite | 39/39, eight files |
| Image pipeline | 2/2, JPG/PNG/WebP/AVIF, originals/dimensions/no upscaling |
| Mobile/desktop E2E | 58/58, final stable run with two workers |
| Link/noindex check | 92 HTML pages, 9,151 local references; no missing assets/anchors, duplicate IDs or indexable preview pages |
| Whitespace/diff check | git diff --check clean |

Browser coverage includes EN/DE/FR, exact outbound URLs and one click event, zero internal affiliate events, market restrictions, original-photo galleries, four viewport widths, no-JS navigation, budget/category migration, UTM/hash, back/forward, empty-state recovery, blocked storage, axe, menu/locale/consent, Effects opt-in/off/reduced-motion, Santa/replay, viewport/tab/concurrency lifecycle and Halloween/Christmas/Black Friday. No external image/decoration requests, new tracker or console/CSP errors in covered browsing paths. Outbound merchant navigation uses fixtures: these tests do not certify live stock, merchant uptime, delivery or commission attribution.

## Final mobile performance

Three consecutive cold-cache Lighthouse runs for each page, on the final production build, separately from E2E. Homepage functional Effects preference explicitly on; all three audits captured self-hosted animation JSON. No best-run selection. Other pages use their normal device-default/static-decoration behaviour. Every run must meet Performance >=90, Accessibility >=95 and CLS <=0.1; the LCP gate is the median <=2,500ms.

| Page / audit label suffix | Performance runs | Accessibility runs | LCP runs (ms) | Median LCP (ms) | Max CLS |
|---|---|---|---|---|---|
| Homepage, home-on | 97 / 97 / 94 | 100 / 100 / 100 | 2407.055 / 2407.000 / 2885.590 | 2407.055 | 0.000035111 |
| Directory, directory | 97 / 97 / 97 | 100 / 100 / 100 | 2408.468 / 2406.828 / 2406.907 | 2406.907 | 0.000035111 |
| Finder, finder | 98 / 98 / 98 | 100 / 100 / 100 | 2254.739 / 2255.792 / 2258.044 | 2255.792 | 0.000035111 |
| Black Friday guide, guide | 98 / 99 / 99 | 100 / 100 / 100 | 2103.041 / 2027.841 / 2026.032 | 2027.841 | 0.000035111 |
| World of Cosmetics profile, profile | 98 / 98 / 98 | 100 / 100 / 100 | 2178.621 / 2178.708 / 2104.595 | 2178.621 | 0.000035111 |

All five page types pass the defined gate. Homepage's third LCP is 2.886s, not hidden; the three-run median is 2.407s. This is local lab evidence, not a field-performance/INP guarantee. Best Practices 100 on all runs. SEO 66 is intentionally limited by noindex, which remains enabled.

Raw files: `lighthouse-sitewide-native-{home-on,directory,finder,guide,profile}-mobile-run-{1,2,3}.json` and matching `-summary.json` in this directory. These local runtime artifacts are ignored by Git; this report preserves every final value. Earlier experiments remain on disk: Finder initial median 2862.006ms, compact props 2712.958ms, idle hydration 2190.758ms but repeat final-island batch 2704.186ms. That instability motivated the native controller, not another selected favourable batch. Finder HTML decreased from 169,912 bytes / 26,728 gzip to 108,641 / 18,848 gzip, without a client React island or its ~66KB compressed hydration runtime. Previous homepage ~2.56s exceeded the gate; final effects-on median is below it.

## Visual review and repaired QA issues

Fresh full-page baselines at 375, 768, 1024 and 1440px: `sitewide-{gift-finder,guides,gifts,campaigns}-{width}.png`, plus current `brands-*`, `official-photos-home-*` and Halloween/seasonal on/off sets. Actual catalog images are scrolled into view and checked loaded/contain before the site-wide screenshots. These are local review baselines, not an enforced cross-platform pixel-diff suite.

Review caught a dark Halloween reading background with dark guide text that automated axe did not detect. Added a light guide wrapper, corrected already-inset container surface edges, and regression-tested the computed background. Repaired Gifts/campaign heading hierarchy, no-JS explanation outside React SSR, and locale UI/policy copy. A touch-target assertion initially included deliberately hidden empty-state controls; it now checks visible controls, still requiring >=48px. Final native-controller full batch passes. An earlier transient 404 came from rebuilding dist during a browser run; final build/test/audit steps were separated.

Guide layout review: [four-width board](sitewide-guide-review-board.png). Detailed examples: [guide mobile](sitewide-guides-375.png), [Finder mobile](sitewide-gift-finder-375.png), [Gifts desktop](sitewide-gifts-1440.png), [campaign desktop](sitewide-campaigns-1440.png).

## Handoff and remaining boundaries

Preview: http://127.0.0.1:5180/en-gb/ (DE/FR available through the locale selector). Operations: [brand runbook](../sitewide-brand-operations.md), [general runbook](../runbook.md), [tracker](../../plan.md). Data/resolvers remain centralized; pause profile/link/merchant and rebuild to disable shopping safely. Change activeEventId/event priority and rebuild for season ordering; do not create fake offers or perform destructive Git resets.

No commit, push, public deployment, new programme/event/market/backend/tracker or indexing performed. Name/domain/hosting, native/legal review, analytics dashboard, live network attribution and actual orders/commissions belong to a separate public-release phase. Approved link availability is not a shipping guarantee or evidence of profit.
