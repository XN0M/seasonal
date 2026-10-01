# Halloween visual refinement — 2026-10-01

Follow-up to user review of the first Halloween hero. Earlier implementation and performance results remain in `halloween-report.md`; those lab results do not certify this changed artwork.

## Defects addressed

- Palette conversion had made pumpkin ribs, face and body the same orange. Tonal roles restored, original friendly round-eye/curved-smile adaptation replaces toothy source expression.
- Source precomposition contained unused transparent area. Crop/recenter now keeps stems visible and places pumpkins near the illustrated ground; float is 45 source units over 10 seconds, with existing motion budget/lifecycle.
- Duplicate crescent removed from hero overlay; one original crescent remains in the illustration. Guides retain their separate moon motif.
- Replaced disconnected flat gift and empty dark space with a shared still-life: detailed kraft folds, ribbon/tag, plum parcel, shaded gourd, autumn branches, warm light, fine stars/web and grounded shadows.
- Three original compositions use shared SVG object definitions: phone <=500px, landscape tablet 501–780px and desktop >780px. All use cover, no aspect distortion. Removed previous tablet contain workaround; same 160px mobile/tablet frame and existing desktop arch/height.
- Tablet pumpkin width capped at 210px so stems are not clipped. Phone gourd moved away from the existing circular seal. No extra section, commerce density, spacing or theme/controller changes.

## Reproducibility / rights / budgets

Run `node scripts/prepare-halloween-hero.mjs`, `node scripts/prepare-halloween.mjs`, then `node scripts/render-decoration-posters.mjs --halloween`. The last command uses local headless Chromium and the existing SVG light player, not an external runtime.

Licensed pumpkin source/body/foliage and source archives retained; facial changes are disclosed as adaptations in provenance and public credits. Original hero is vector code, with no generated brand packaging. JSON gzip: pumpkin1858B, ghost5971B, star766B, total8595B; complete animation directory14567B gzip, below500KB. Hero raw/gzip bytes: desktop7829/2414, phone7893/2427, tablet7987/2459. No image/font/filter/script/expression/external resource added.

## Verification

- Strict production build: 77 checked files, zero errors/warnings/hints, 60 Astro pages.
- Unit: 25 pass, including new tonal contrast, three hero assets/safety/budget tests.
- Final browser regression: 36 pass, Chromium desktop/mobile, 1.1 minutes; no skipped cases. EN/DE/FR axe, 375/768/1024/1440 on/off captures, reduced-motion explicit opt-in, legacy off/storage/asset/no-JS fallbacks, viewport/tab stop, 3/2 concurrency, safe-zone collisions, overflow and newly added hero-wrapper containment all pass.
- Existing menu/market/Finder/URL/history/anchor/affiliate-fixture behaviour, Christmas Santa/replay and Black Friday regressions pass. No browser console/CSP errors or external-decoration requests in tested paths.
- Built-link scanner: 62 HTML pages, 4063 local references; no broken asset/anchor, duplicate IDs or indexable preview page.
- Screenshots refreshed: `halloween-{375,768,1024,1440}-{on,off}.png`, equivalent hub captures, `halloween-full.png`, three locale reduced-motion captures and `halloween-assets.png`. Reviewed desktop, phone and tablet; final tablet removes clipped stem, phone face is clear of seal. Full-page evidence retains the known preview concept cards, not fake Halloween offers.

## Fresh active-effects mobile measurements

Isolated Chromium profile, functional Effects preference explicitly on, cleared cache. Every run verified a local Lottie JSON request; not a static/reduced-motion-only audit. No E2E or other audit ran concurrently. Raw JSON is gitignored; all batches, including the failed gate, are preserved below.

| Batch / run | Performance | Accessibility | Best practices | LCP ms | CLS | TBT ms |
|---|---:|---:|---:|---:|---:|---:|
| Home initial / 1 | 89 | 100 | 100 | 2708.0681 | 0.0000351108 | 286 |
| Home initial / 2 | 97 | 100 | 100 | 2406.3392 | 0.0000351108 | 20 |
| Home initial / 3 | 97 | 100 | 100 | 2406.3995 | 0.0000351108 | 18.5 |
| Hub / 1 | 97 | 100 | 100 | 2265.87025 | 0.0000351108 | 76.34775 |
| Hub / 2 | 96 | 100 | 100 | 2405.2972 | 0.0000351108 | 117.0271 |
| Hub / 3 | 95 | 100 | 100 | 2405.7180 | 0.0000351108 | 144.2115 |
| Home repeat / 1 | 97 | 100 | 100 | 2407.4657 | 0.0000351108 | 19 |
| Home repeat / 2 | 97 | 100 | 100 | 2407.0668 | 0.0000351108 | 20.5 |
| Home repeat / 3 | 97 | 100 | 100 | 2405.4285 | 0.0000351108 | 20 |

Initial home batch (`halloween-refined-home-on`,02:33UTC) fails the all-runs Performance>=90 gate: first run P89. Its median LCP2406.3995ms, accessibility and CLS gates pass. Trace reports three long tasks, including 622ms labelled Unattributable; exact causal contribution is not established. Do not attribute the outlier to external software or hide it.

Hub (`halloween-refined-hub-on`,02:36UTC): median LCP2405.2972ms, P97/96/95, all specified local lab gates pass. Home repeat on the same UI/art build (`halloween-refined-home-repeat-on`,02:38UTC): median LCP2407.0668ms, P97/97/97, all specified local lab gates pass. No intervening optimisation is claimed for that repeat; it documents variation, not a guarantee that every future run will meet the floor. Across all nine readings, one is below the performance target. SEO66 intentionally reflects noindex and is not permission to enable indexing. TBT is not field INP.

Final complete home/hub batches meet the target; the initial failing batch remains a known lab-variance caution. Physical devices and production metrics are still unverified.

## Limits / handoff

Local preview only; no commit, push or deployment. Preview noindex stays intact. No real Halloween catalog/offer added; commercial identity, native translation review and production gates remain. Chromium lab/device emulation is not physical-device or Firefox/WebKit/RUM certification. Existing functional preference behaviour remains document-local if storage is blocked.

Subjective visual approval remains with the user. This refinement improves detail/composition, not a claim that decorations increase conversion. Further revisions should retain the shared controller, composition budgets and shopping safe zones.
