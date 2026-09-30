# Seasonal assets — 2026-09-30

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
