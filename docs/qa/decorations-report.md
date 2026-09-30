# Event backgrounds and decoration QA — 2026-09-30

Local preview only: Christmas homepage and Black Friday event hub, EN/DE/FR. Previous Christmas reports remain historical; this system replaces the hero-only renderer. No deployment, commit, push, indexing change or real affiliate offer was introduced.

## Implementation and asset gate

- Six homepage placements: header, hero, Quick Finder, Family, Guides, footer. Four event-hub placements: header, hero, event information, footer.
- Finder uses header/footer only; guide, brand and policy pages use static shell decoration. Current-event background follows the existing page event; Finder filters do not change the page shell.
- Christmas ivory/ice ambience and fir/champagne/oxblood; Black Friday cream/green/champagne. Existing grid, typography, radii, section spacing, shopping interactions and product image fit retained.
- Four licensed LottieFiles motifs, adapted into six self-hosted JSON files. Original code-native header/footer motifs and snow/Santa use the same controller. Source archives are outside public output; [sources and license](../assets/provenance.md) and [public credits](../../public/animations/credits.html).
- JSON gzip totals: Christmas 31,351B; Black Friday 7,266B. Complete event directories including JSON, SVG and responsive WebP: 114,734B / 12,139B. Each JSON below 150KB and each event below 500KB; shared player cost is included in Lighthouse, not hidden by this asset budget.
- SVG light player loaded after primary paint and an idle opportunity. Complex tree poster has 320/480px WebP derivatives; active tree stays vector SVG, with its mature segment playing instead of an empty-pot build-in.
- Decorations do not receive pointer events and are hidden from screen readers. Ornaments shrink within existing padding bands; header controls/focus outlines are layered above the thin ribbon. No product card overlay, fabricated logo, SALE text, money motif or new tracker.

## Verification

- Strict production build: 72 checked source files, zero errors/warnings/hints; 57 generated Astro pages.
- Vitest: 22 tests across five files. Preference migration/override, locale copy, unsupported Lottie features, poster existence and complete asset gzip budgets included.
- Browser regression: all 30 desktop/mobile tests pass on the final responsive-poster/idle build; zero skipped/flaky/unexpected results (16:20 UTC batch, 69.1s).
- Build scanner: 58 HTML pages including animation credits; 3,860 references; no broken assets/anchors, duplicate IDs or indexable preview page.
- Production dependency audit: zero reported vulnerabilities on 2026-09-30. Not a guarantee against future advisories.
- Production-output Astro CSP is enforced in the local browser: no unsafe-inline/eval relaxation, no remote decoration request. Deployed Cloudflare HTTP headers are not certified by local preview tests.

Browser coverage includes keyboard/mobile menu, market switching, Finder URL filters, FAQ/anchors, disabled commerce, exact affiliate fixture payload and expired-link blocking. Decoration coverage includes 6/4/2 placement counts, localized axe checks, legacy off/on migration, explicit reduced-motion opt-in, persistence, three-second Santa/replay, no-JS/blocked storage/503 fallback, load/viewport/tab pause and the 3-desktop/2-mobile motion budget. Santa counts toward the limit; tree/snow are one hero composition.

Geometry checks at 375/768/1024/1440 verify no horizontal overflow or intersection of non-hero ornaments with visible headings, paragraphs, links, buttons, selectors or product cards. The hero decoration stays in the empty image corner, not over copy/CTA; full-page visual references additionally show the commerce grids.

## Mobile Lighthouse — effects explicitly on, cold HTTP cache

Independent Chrome profile per run, only functional Effects preference preserved; HTTP cache cleared after preference setup. JSON fetch is verified in each audit so a reduced-motion/static default is not misreported as active-animation performance. Measured 2026-09-30 at 16:15–16:18 UTC against the final responsive-poster/idle build.

| Page / run | Performance | Accessibility | Best Practices | LCP ms | CLS | TBT ms |
|---|---:|---:|---:|---:|---:|---:|
| Christmas 1 | 95 | 100 | 100 | 2559.42 | 0.0000351 | 122 |
| Christmas 2 | 97 | 100 | 100 | 2479.65 | 0.0000351 | 44 |
| Christmas 3 | 97 | 100 | 100 | 2478.67 | 0.0000351 | 52 |
| Black Friday 1 | 97 | 100 | 100 | 2405.78 | 0.0000351 | 22 |
| Black Friday 2 | 95 | 100 | 100 | 2716.68 | 0.0000351 | 23.5 |
| Black Friday 3 | 97 | 100 | 100 | 2406.35 | 0.0000351 | 29 |

Christmas median LCP **2479.646ms**; Black Friday **2406.354ms**. Both pass all specified lab gates: every Performance ≥90 / Accessibility ≥95, median LCP ≤2500ms, every CLS ≤0.1. Individual LCP runs can exceed 2500ms; the acceptance criterion is the three-run median. SEO stays 66 because required noindex is retained. TBT is not field INP; these local lab results do not guarantee production or physical-device performance.

Initial Christmas device-default median was 2630.208ms; first explicit-on batch had median 2936.757ms and one Performance 88. Initial Black Friday on median was 2714.216ms. Responsive raster tree posters and paint/idle scheduling repaired the gate without disabling all motion or delaying products. Initial summaries are retained in ignored local JSON alongside final labeled runs.

Reproduce:

```sh
npm run audit:mobile -- --runs=3 --label=decor-christmas-on --effects=on
npm run audit:mobile -- http://127.0.0.1:5180/en-gb/events/black-friday/ --runs=3 --label=decor-black-friday-on --effects=on
```

## Visual references

Six adapted motifs: [asset board](decoration-assets.png). All first-fold states: [responsive board](decor-responsive-board.png), ordered Christmas then Black Friday, each width on/off. Full-page references: [Christmas](decor-christmas-full.png), [Black Friday](decor-black-friday-full.png).

| Width | Christmas on / off | Black Friday on / off |
|---|---|---|
| 375 | [on](decor-christmas-375-on.png) / [off](decor-christmas-375-off.png) | [on](decor-black-friday-375-on.png) / [off](decor-black-friday-375-off.png) |
| 768 | [on](decor-christmas-768-on.png) / [off](decor-christmas-768-off.png) | [on](decor-black-friday-768-on.png) / [off](decor-black-friday-768-off.png) |
| 1024 | [on](decor-christmas-1024-on.png) / [off](decor-christmas-1024-off.png) | [on](decor-black-friday-1024-on.png) / [off](decor-black-friday-1024-off.png) |
| 1440 | [on](decor-christmas-1440-on.png) / [off](decor-christmas-1440-off.png) | [on](decor-black-friday-1440-on.png) / [off](decor-black-friday-1440-off.png) |

Captures use CSS-pixel scale, decoded images/fonts and eager media priming only inside test pages for full-page artifacts. No production lazy-loading behaviour was changed for screenshots. The batch initially exceeded the 60s high-DPR artifact timeout; CSS-pixel capture removed that overhead. This is manual visual review plus geometric assertions, not pixel-diff certification.

Additional isolated-context checks at 375px: German and French reduced-motion opt-in notices both fit the original 54px control reservation, with zero axe violations or horizontal overflow. Visual references: [German](decor-reduced-de-de.png), [French](decor-reduced-fr-fr.png); Santa is visible mid-flight. These are extra diagnostics, separate from the 30-test regression suite.

## Limits and handoff

- Effects toggle: desktop header / mobile menu. Default follows device preference; explicit on overrides decoration only and explains that choice, including in Christmas hero controls. Old off migrates; old on is not consent to override.
- No JavaScript: static poster and browsing remain available; inactive controls stay hidden. Blocked storage: choices/Santa memory are document-local and can repeat after navigation/reload. Failed Lottie: poster remains, no crash.
- Other events/markets and full-page Christmas snowfall are not added. Snow stays in the hero's empty image zone; page edges use static event ambience. Current-event page shells are preserved, not coupled to affiliate/filter data.
- Physical devices, Firefox/WebKit, deployed headers, real assets/merchant offers, human-reviewed translations, field INP and conversion/EPC still require their original launch gates.
- No public deploy, GitHub push or commercial claim. Preview remains noindex.

Final browser confirmation: 30/30 passed. No browser console/CSP/asset errors or external decoration request; noindex retained; link scanner and git diff whitespace checks pass.
