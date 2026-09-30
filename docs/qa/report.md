# Preview verification — 2026-09-30

Target: built Astro static output at `http://127.0.0.1:5180/en-gb/`, not a deployed Cloudflare domain.

| Check | Result | Evidence |
|---|---|---|
| Production build | 57 HTML pages; 0 errors, warnings or hints | `npm run build` |
| Unit tests | 18 passed in 4 files | `npm test` |
| Browser tests | 18 passed, desktop + mobile Chromium | `npm run test:e2e` |
| Built URL/asset scan | 57 pages, 3318 local references; no missing assets/anchors or duplicate IDs | `npm run test:links` |
| Preview indexing guard | Every generated HTML page has noindex | build scanner + browser assertions |
| Dependency advisory scan | 0 vulnerabilities reported | `npm audit --audit-level=high` |
| Cloudflare package validation | Passed; 205 static files at that build | `npx wrangler deploy --dry-run` |
| Real Cloudflare deployment | Not performed | Wrangler authentication missing |

Browser coverage: homepage widths 375/768/1024/1440 with overflow checks; localised market/event switching; five Finder criteria and URL/UTM state; keyboard Escape/focus restoration; FAQ and anchor navigation; reduced motion; tested form/button targets at least 48px; privacy preference changes; no unconfigured SDK requests; no console/page/HTTP asset errors on selected core routes. Axe checks cover EN/DE/FR homepages, Black Friday, Finder and the four-theme design-system route.

Affiliate tests use an intercepted `merchant.example` fixture, not a real merchant. They verify exact tracking URL, same-tab navigation, sponsored/nofollow attributes, payload and blocked expired clicks. Unit tests cover status, allowlists, market/currency, tracking, credentials, record relationships, timestamps, stale/unknown prices, event phases, references and JSON-LD escaping. No preview record has an active outbound CTA.

## Latest mobile Lighthouse

Run time: 2026-09-30 09:29 UTC, after final touch-target/footer fixes. Lighthouse 13.5, local production HTML, default mobile simulated throttling. No browser tests ran concurrently with this measurement.

| Metric | Measured | Target/status |
|---|---:|---|
| Performance | 96 | ≥90 — pass in this run |
| Accessibility | 100 | ≥95 — pass |
| Best Practices | 100 | ≥95 — pass |
| SEO | 66 | Intentionally limited by preview noindex |
| LCP | 2565ms | Slightly above ≤2500ms; not a stable pass yet |
| CLS | 0 | ≤0.1 — pass |
| TBT | 0ms | Diagnostic only; not INP |
| INP | Not measured | Requires real-user/interaction measurement on deployment |

The only failed SEO audit is `is-crawlable`, because noindex and robots blocking are required. Do not remove either to increase a preview score. Public SEO ≥95 is not verified. Empty preview sitemaps intentionally do not submit noindex pages.

Earlier lab runs varied from 91–97 Performance and 2.48–3.1s LCP; the 09:12 UTC run measured 2483.58ms. The latest result is reported above, rather than selecting the best score. Improvements: font/hero preload, responsive images, zero header React hydration and no consent React runtime in an unconfigured preview. LCP remains close to the threshold but needs more margin and verification on the actual deployment. Rerun after real images, trackers or content changes. No lab run guarantees field performance.

## Visual evidence and remaining gates

`homepage-375.png` and `homepage-1440.png` are reviewed first-viewport references. Full-height and 768/1024 screenshots are regenerated in ignored `test-results/`. These are review baselines, not an enforced pixel-diff gate. Firefox/WebKit and real-device tests remain pending. Axe does not certify every future colour pairing.

Remaining: stable LCP ≤2500ms; official identity/domain/operator; 20 rights-cleared products; ten verified offers per market; full DE/FR human review; product/age/safety sources; brand details; real shipping deadlines; legal/consent review; configured analytics/reporting; Cloudflare authentication/deployment and header checks; connected daily refresh and rollback rehearsal; public publishing controls; RUM/INP. Halloween content and fuller category/comparison experiences also remain open.

This report approves local preview review, not public launch or paid traffic.
