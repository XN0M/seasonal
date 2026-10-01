# Seasonal assets — 2026-09-30

## Halloween additions — 2026-10-01

### Visual refinement after user review — 2026-10-01

The initial palette mapping erased pumpkin face/rib colour differences. The reproducible adapter now preserves warm light/body/shadow/rib/face tones and a muted stem, retains the licensed body/foliage, and replaces the source's diamond eyes/toothy mouth with original round eyes/curved smile. The composition is recentered (2105×1300) without clipping stems; float amplitude is 45 source units, still one ten-second loop. Final JSON gzip: pumpkin1858B, ghost5971B, star766B (8595B total). Source archives and license remain unchanged. These are licensed adaptations, not unmodified source assets.

`scripts/prepare-halloween-hero.mjs` generates original phone/tablet/desktop SVG compositions from shared vector definitions. Kraft-paper gift folds, satin-style ribbon/tag, plum gift, softly shaded smiling gourd, autumn branches, a single moon and grounded shadows are original illustrations, not merchant products. No brand/logo/packaging is fabricated; no raster generation, image, font, expression or SVG filter/script/external resource is used. Poster regeneration: `node scripts/render-decoration-posters.mjs --halloween`. Earlier measurements below describe the first version and are preserved as history.

Free source pages explicitly show the Lottie Simple License. Downloads use the public Creator preview links supplied by those pages; no authentication or paid download bypass. Direct page fetching returned 403, so sources were inspected through the web connector's public page view. No third-party decoration request is made by website visitors.

| Motif | Author | Source page | Public source archive |
|---|---|---|---|
| Pumpkin | Midhun Mohan | https://lottiefiles.com/free-animation/halloween-pumpkin-L100fJYzYW | https://assets-v2.lottiefiles.com/a/a4b4657a-1152-11ee-9867-abdb1627a210/dG1whSuasv.lottie |
| Ghost | Alex Bradt | https://lottiefiles.com/free-animation/ghost-ry2y97Jus9 | https://assets-v2.lottiefiles.com/a/66b41ff6-1173-11ee-8529-27362b9a3769/Ls9PA1yfbJ.lottie |
| Stars | Mahmud Hasan | https://lottiefiles.com/free-animation/stars-u0Jnr6UxeD | Existing verified source archive retained |

Adaptations: three accents and ivory neutrals; ten-second loops. Ghost's grave, heart and outlined lettering layers are removed; composition cropped/recentered around the friendly character. Original source archives retained outside public. Pumpkin retains the licensed vector forms but replaces wide entrance/sideways choreography with three continuously visible pumpkins, static internal transforms and a seamless 60-source-unit vertical float (under 8px at the maximum 240px decoration width), 24fps; smiling pumpkin in the original hero art supplies the friendly face. JSON gzip sizes: pumpkin 1899B / ghost 5971B / star 766B, total 8636B. `scripts/prepare-halloween.mjs` validates source vectors and reproduces adaptations; posters use the existing SVG light player. Header web, moon, footer web and square/landscape hero illustration are original SVG. No fonts, expressions, external images/audio or branded packaging. Complete license/author notice also shipped in `public/animations/credits.html`.

Historical Christmas/Black Friday records below are unchanged.

All selected pages displayed “Free to use under the Lottie Simple License”. Files were obtained from publicly exposed Edit with AI preview links, not a private API or paid download. See public/animations/credits.html for sources, authors and license text.

| Motif | Author | Public preview source | Gzip Christmas / BF |
|---|---|---|---|
| Tree | JAStudio | https://assets-v2.lottiefiles.com/a/5f4c4f92-1167-11ee-bb74-6ba7b30a5a69/v6m0RqwoS1.lottie | 28066 / not shipped |
| Gift | KaramAhn | https://assets-v2.lottiefiles.com/a/cb02c4c2-1186-11ee-b617-b3a6f9352d7d/VGqL2vIBjM.lottie | 2514 / 2518 bytes |
| Star | Mahmud Hasan | https://assets-v2.lottiefiles.com/a/a4cec16c-1171-11ee-b9a5-6b558f095160/GVbXUWaV8l.lottie | 771 / 773 bytes |
| Bag | Anwar Khan | https://assets-v2.lottiefiles.com/a/eafdb90e-5850-11f0-9390-0be836daed63/YlH7m0gYuu.lottie | not shipped / 3975 bytes |

Source pages, authors and the complete Lottie Simple License are retained in `public/animations/credits.html`. The license permits commercial use and adaptation, with copyright/license notice retained. Asset links are references only; visitors never request these third-party URLs.

Rejected: Gift by Giovanna Calveyrac (embedded PNGs); Christmas Lights by Anil bhardwaj and Shopping Bag Icon by Julian Violé (expressions/text); Shopping Bag by Muhammad Abrar (unwanted symbol); Ribbon by Max Young (confetti rather than the required motif). Downloaded archives are retained outside public output for traceability, not used in the site.

Adaptation: semantic three-accent palette + neutral ivory, six-to-twelve-second timing; original keyframes retained. Tree playback uses the mature 55–98% segment at reduced speed, avoiding the empty-pot intro. Static SVG posters rendered locally with the same light player at 55% of source timeline. The complex tree poster additionally has 320/480px transparent WebP derivatives and responsive srcset for lower initial paint/transfer cost; the animated tree remains vector SVG. Header garland/ribbon, footer wreath/bow, snow and Santa are original SVG/CSS; light player is used for the other placements. No font/image/audio/expression or external asset paths in shipped JSON.

JSON gzip totals: Christmas 31,351 bytes; Black Friday 7,266 bytes. Each JSON is below 150KB; each event's complete public asset directory (JSON + SVG + WebP) is below 500KB gzip. `tests/seasonal.test.ts` checks these budgets and light-player safety. The shared player is separately included in the actual Lighthouse payload/runtime assessment. `docs/qa/decoration-assets.png` shows the six adapted posters. The original files come from multiple authors (no compatible complete free set was available); the shared palette and flat-vector presentation unify them. No Premium asset or placeholder is used.

Complete directory gzip totals after responsive poster optimisation: Christmas 114,734B; Black Friday 12,139B (including the retained source SVG poster). First content paint has priority: motion starts only after window load, two animation frames and an idle opportunity. The poster is immediately available and shopping interactions are never gated on decoration readiness.
