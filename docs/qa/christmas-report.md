# Christmas presentation QA — 2026-09-30

Target: local production output at `http://127.0.0.1:5180/en-gb/`, not a deployed domain. Scope: Christmas home/event heroes and shared shapes/UI feedback. Colours, typography, commerce records, affiliate eligibility, routes and preview noindex retained.

## Verification

| Check | Result |
|---|---|
| Strict Astro/TypeScript build | 57 HTML pages; zero errors, warnings or hints |
| Vitest | 21 passed in five files |
| Playwright | 32 passed, Chromium desktop and mobile emulation |
| Built links/assets/indexing | 3775 local references; no missing assets/anchors, duplicate IDs or indexable HTML |
| Browser console/CSP/assets | No errors on tested home/locales/Finder/guide/privacy routes |
| Accessibility | axe checks pass for EN/DE/FR home, Christmas hubs, Black Friday, Finder and design system |
| Responsive | 375, 768, 1024, 1440px: no horizontal overflow; scene controls ≥48px high |
| Commerce regression | Preview cards do not lift/zoom, navigate commercially or emit affiliate events; exact tracking/sponsored/nofollow/same-tab and expired-link fixture tests retained |

Seasonal tests cover initial-load gating (held hero-image request), 12 desktop/6 mobile visible snow particles, keyboard toggle, local preference persistence, three-second Santa completion/replay, once-per-tab-session across reload and event navigation, reduced-motion changes (including stored effects on), storage exceptions, no-JS static content, offscreen pause and simulated document-visibility events. Tab visibility is a deterministic lifecycle simulation, not a real-device benchmark.

## Mobile Lighthouse

Final batch, 11:19 UTC on 2026-09-30, Lighthouse 13.5. Command: `npm run audit:mobile -- --runs=3`. Runs use separate Chromium launches, default Lighthouse mobile simulated throttling, and no concurrent browser suite. JSON reports/summary are generated in ignored `docs/qa/lighthouse-mobile*.json`.

| Run (UTC) | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 — 11:19:17 | 97 | 100 | 100 | 66 | 2404.54ms | 0 | 10ms |
| 2 — 11:19:26 | 97 | 100 | 100 | 66 | 2403.56ms | 0 | 21ms |
| 3 — 11:19:35 | 97 | 100 | 100 | 66 | 2404.54ms | 0 | 14ms |

Median LCP **2404.535ms**. All three runs meet Performance ≥90, Accessibility ≥95 and CLS ≤0.1; median LCP meets ≤2500ms. The final batch is reported, not the best single measurement. A preceding optimized batch also measured a 2405.736ms median; final TBT values are diagnostic only.

Initial upgrade batch measured Performance 96 / Accessibility 100 / Best Practices 100, median LCP 2564.35ms; max CLS 0.03396. We reserved the controls' initial space, compensated mobile hero padding, and inlined the small built page styles (CSP-hashed) to remove critical stylesheet round trips. No policy relaxation, animation library or external decoration request was introduced. The current visual seal remains anchored to the image even when the reduced-motion explanation adds a row.

SEO remains intentionally limited by required noindex. TBT is a diagnostic, not field INP. Lab results do not guarantee deployed performance or conversion improvements.

## Reviewed visual evidence

First-viewport references, effects **on / off**:

- 375px: [on](christmas-375-on.png), [off](christmas-375-off.png).
- 768px: [on](christmas-768-on.png), [off](christmas-768-off.png).
- 1024px: [on](christmas-1024-on.png), [off](christmas-1024-off.png).
- 1440px: [on](christmas-1440-on.png), [off](christmas-1440-off.png).
- [Santa mid-flight](christmas-santa.png), [reduced-motion static scene](christmas-reduced-motion.png), [rounded product cards](christmas-product-cards.png).

Full-page on/off screenshots are regenerated in ignored `test-results/`. References were manually inspected, not enforced as pixel-diff baselines. Product grid density/spacing remain unchanged; static section-title ornaments are hidden from screen readers. Decorations cannot intercept clicks and are clipped to the hero image.

## Limits and handoff

- Preview only; no public deployment, indexing change, GitHub commit or push in this upgrade.
- Storage blocked: no browser crash; preferences cannot survive reload and Santa can repeat in a new document. With JavaScript disabled, the static ornaments remain and unusable controls stay hidden.
- Effects toggles do not load trackers; their local/session storage is described in the preview privacy policy. Existing policy translation/legal review gates remain open.
- Firefox/WebKit, physical devices, deployed headers, field INP and real conversion/EPC remain unverified.
- Official identity, real products/offers, image rights, translations and production provider/deployment gates remain as recorded in `plan.md`.
- Only Christmas has a scene; other event scenes and Thanksgiving are not implemented in this upgrade.
