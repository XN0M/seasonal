# Halloween preview QA — 2026-10-01

Scope: Halloween as the explicit October preview on EN/DE/FR. Local static production build only; no push, commit, deployment, tracker, market expansion or commercial offer added. Historical Christmas/Black Friday reports and assets are retained.

Status: complete for local preview. Final build/check has zero diagnostics; final 36/36 browser run passed in 54 seconds after the tablet scoped-style correction. Phase/task evidence is recorded in `plan.md`.

## Implementation and visual review

- `src/data/campaign.ts` selects `halloween-2026` by ID; unknown IDs fail. Local-market dates are 31 October 2026 in Europe/London, Europe/Berlin and Europe/Paris. Theme selection never follows the visitor's clock or Finder filter.
- Halloween event routes, titles/descriptions, hero copy/alt, preparation-phase labels and Finder shortcuts are localized. Christmas/Black Friday hubs retain their themes and routes.
- Dark aubergine exterior/hero, ivory commerce/filter surfaces; scoped hero-region tokens keep muted text readable without changing product-card ink. Existing grids, section spacing, rounded shapes and product image fit remain unchanged.
- Original square and landscape SVG hero; mobile art direction fits the existing 160px frame without cutting off the smiling pumpkin. No Christmas branches/ribbon photograph, generated logos or branded packaging in Halloween hero.
- Six homepage points: header web/stars, hero pumpkin/moon, Finder ghost, Family pumpkins, Guides moon/stars, footer ghost/web. Four hub points; two Finder points; static guide/brand/policy shell. Ornaments stay in existing safe padding/absolute wrappers and cannot intercept input.
- Free licensed Midhun Mohan pumpkin, Alex Bradt ghost and reused Mahmud Hasan stars. Grave/lettering/heart removed from ghost; pumpkin source entrance choreography replaced with a continuous gentle vertical float, not sideways movement. Source archives, authors, license and adaptations in `docs/assets/provenance.md` and public credits. Final JSON gzip: 1899/5971/766 bytes; total 8636B. No unsupported expression/font/image/external resource or Premium asset.
- Shared controller constructs only visible, selected players after primary paint/idle; 3 desktop / 2 mobile movement limit includes native effects. Slow Halloween timelines use native frame rates without redundant display-rate subframes. Lazy non-hero images have low fetch priority so they do not compete equally with the high-priority hero/preloaded fonts. Offscreen/background-tab playback stops; header is one-shot.
- Existing auto/on/off preferences and legacy off retained. Reduced-motion defaults static; keyboard/touch explicit opt-in enables decoration only. Halloween has no Santa, snow, replay button or reserved replay space. Christmas once/session Santa and replay regressions pass.
- No product/offer retagging. Halloween hub and event-filtered Finder intentionally have no verified products/offers and link to other events. Generic homepage concepts explicitly are not Halloween recommendations. No empty Halloween paid campaign route was added.

## Functional evidence

- `npm run build`: 76 files checked; zero TypeScript/Astro errors, warnings or hints; 60 generated Astro pages.
- `npm test`: 24 tests / 5 files pass, including market/DST-aware dates, honest phase labels, loop continuity/amplitude, preference migration, self-contained asset checks and budgets.
- `npx playwright test`: 36 tests pass across Chromium desktop and mobile emulation; no skipped/flaky tests. Includes EN/DE/FR axe, computed hero gradient contrast, keyboard opt-in, menu/market/Finder/history, anchors/FAQ/touch, pause/visibility/loading budget, storage/asset failure/no-JS and unchanged same-tab affiliate fixture/expired-link behaviour.
- `npm run test:links`: 62 HTML pages including credits, 4057 local link/asset references; no missing anchors/assets, duplicate IDs or indexable preview pages.
- Browser checks: no console, CSP, page or asset errors and no external decoration requests. CSP was not weakened; `noindex` remains. Astro preview does not emulate Cloudflare response `_headers`; deployed headers remain a separate gate.
- `git diff --check`: pass. Dependencies/lockfile unchanged in this upgrade.

## Screenshot evidence

Tracked first folds: `halloween-{375,768,1024,1440}-{on,off}.png` and `halloween-hub-{375,768,1024,1440}-{on,off}.png`; decoded full page: `halloween-full.png`; asset board: `halloween-assets.png`; explicit reduced-motion opt-in: `halloween-reduced-{en-gb,de-de,fr-fr}.png`. CSS-pixel capture avoids high-DPR artifact overhead. Images are primed only in the full-page test, not production.

Visual review initially caught a scoped hero-muted-colour override and square-image mobile cropping even though axe did not report the gradient contrast. Repaired with semantic hero variables and a landscape source; added computed-colour tests against the brightest gradient stop and responsive source assertions. Localized headlines shortened rather than changing typography/layout. All target widths have zero overflow and no non-hero decoration intersection over protected headings/paragraphs/links/buttons/selects/product cards.

These are reviewed references, not automated pixel-diff certification or physical-device screenshots. Final artifact refresh covers home and hub at all four widths. A later tablet-only review found that the existing 160px-wide hero frame at 768px crops even the landscape art; Halloween's original illustration uses contain against the night backdrop at 501–780px only. Smartphone/desktop art, product image fit and hero frame height are unchanged; responsive tests assert this tablet treatment. Mobile Lighthouse uses 412px, outside that tablet-only query.

## Mobile Lighthouse — actual Effects on

Isolated Chrome profiles; only the functional Effects preference retained; HTTP cache cleared before each run. Each run verifies local Lottie JSON loaded. No device-default/static score is used as active-animation evidence.

Initial homepage batch (`lighthouse-halloween-home-on-mobile-summary.json`): P71/97/97, A100/BP100; median LCP2406.6883ms, CLS0.0000351108. First run had 1259ms TBT with a 1609ms unattributable long task; it was not accepted or hidden. Asset choreography/internal transforms and initial player construction were simplified before a new complete three-run batch. The precise external contribution to that initial outlier is not established.

Intermediate post-choreography batches (`*-final-on-mobile-summary.json`) also failed gates and are retained: homepage P96/97/95 with median LCP2643.6892ms; hub P99/99/89 with median LCP2031.5075ms. A100/BP100 throughout. These were not used as final acceptance. Further changes: all Halloween playback respects native frame rate, and non-hero image fetch priority is low. No layout/spacing, product visibility, indexing or shopping function was sacrificed.

Verified optimized homepage batch (`lighthouse-halloween-home-optimized-on-mobile-summary.json`, 01:34 UTC):

| Run | Performance | Accessibility | Best practices | LCP ms | CLS | TBT ms |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 97 | 100 | 100 | 2406.9735 | 0.0000351108 | 56 |
| 2 | 97 | 100 | 100 | 2425.5041 | 0.0000351108 | 41.5 |
| 3 | 97 | 100 | 100 | 2440.9250 | 0.0000351108 | 46 |

Homepage median LCP **2425.5041ms**; all requested homepage gates pass. First optimized hub batch (`halloween-hub-optimized-on`) P78/99/99, median LCP2117.0968ms; one 763ms TBT outlier still fails its all-runs Performance gate. The hub's secondary event-info ghost therefore stays a static licensed poster, as permitted by the performance fallback in the approved plan; hero/header/footer keep shared-controller motion and all four placements remain.

First static-info hub batch recorded P97/98, then failed in the third run with a Lighthouse/Puppeteer `ConnectionClosedError` during navigation cleanup. It has no complete summary and is not counted as acceptance. A complete three-run retry on the same build/configuration (`lighthouse-halloween-hub-verified-on-mobile-summary.json`, 01:52 UTC) produced:

| Run | Performance | Accessibility | Best practices | LCP ms | CLS | TBT ms |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 90 | 100 | 100 | 2330.3542 | 0.0000351108 | 333.16145 |
| 2 | 97 | 100 | 100 | 2330.5350 | 0 | 23 |
| 3 | 98 | 100 | 100 | 2104.0879 | 0.0000351108 | 85.978025 |

Hub median LCP **2330.3542ms**. Every specified local mobile acceptance gate passes for both final complete batches: each P>=90/A>=95, median LCP<=2500ms, CLS<=0.1. CPU/score variation remains visible; this is not a guarantee of production or physical-device performance. The precise external contribution to unattributable lab long tasks is not established.

Raw JSON/summary files are local generated artifacts (gitignored); measured results are preserved here. SEO66 is expected because preview stays noindex, not permission to enable indexing. TBT is not real-user INP. No initial or intermediate batch is discarded from the record.

## Operating limits / rollback

Visual follow-up after user review: see `halloween-refinement-report.md` for the new artwork, responsive composition and fresh verification. The figures above are historical first-version results. Updated screenshot paths now show the refined version, not the first composition.

See `docs/runbook.md` → Switching the October preview / Halloween rollback. After 31 October manually select `black-friday-2026` and rebuild; rollback to `holiday-2026` or another previously approved ID without removing records/assets/routes. Record date/reason/checks in `plan.md`. No new scheduler or automatic season switch.

Local preview: http://127.0.0.1:5180/en-gb/ ; Halloween hub: http://127.0.0.1:5180/en-gb/events/halloween/ . On mobile open the menu for Effects; desktop control is in the header. Device reduced-motion remains respected unless explicitly enabled.

Unchanged launch blockers: working identity/domain, real catalog/merchant approvals/offers/image rights, human DE/FR copy review, privacy/services and deployment validation. Physical-device/Firefox/WebKit, real-user INP and production performance are unverified. TBT is not INP; preview SEO is intentionally limited by noindex. Storage blocked means functional preferences remain document-local. This report is not permission for public launch or paid traffic.
