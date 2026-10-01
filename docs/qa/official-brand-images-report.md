# Official brand images and homepage slots — local QA, 2026-10-01

## Delivered scope

Twenty official catalog images cover all ten brand profiles and their thirty localized routes. Four existing Women slots now contain beauty/self-care/fashion brands; two existing Family slots contain home/creative brands. The duplicate standalone homepage brand listing was removed. Directory and introduction pages remain; neither Gift Finder nor product-offer inventory was altered.

World of Cosmetics has three product images, SchenkDeinLied one service illustration, and each of the other eight brands two images. Toybox bundles are visibly described as EU catalog examples, not guaranteed UK SKUs. Unbranded editorial story pictures remain context art, not product photos or brand endorsements. Other product-concept routes retain explicit preview labels.

Shopping eligibility remains independent of imagery: GB — World of Cosmetics, Blue Oasis, Toybox; FR — Cocon de Lune; DE — SchenkDeinLied. Other market actions remain disabled with explanations. Original referral domains, ref/rfsn and UTM values are unchanged. Featured image/title/button links use the same brand-home referral URL, not the product evidence URL. No price, stock, rating, sale or medical result is invented.

## Sources, originals and permission basis

The owner explicitly requested official merchant pictures instead of uploads and confirmed affiliate image-use permission. This is owner-provided evidence for the local preview, not an independently reviewed merchant/artist agreement. Editing a picture does not replace permission. In particular, World of Cosmetics' public programme now names TradeTracker; confirm the supplied GoAffPro referral and creative agreement before publication. No commission attribution has been proven by a local click.

`assets/brand-images.json` records localized identity, descriptions, alt, product evidence and official image URLs. `docs/assets/brand-image-provenance.json` records download date, permission basis, original dimensions/bytes and SHA256. Tests recompute original hashes. Operator-only public GETs are host/store-path allowlisted, reject unsafe redirects/non-image/oversized/animated input and never overwrite originals. No account/login or affiliate-link click was used to gather sources.

Original bytes are preserved; local AVIF/WebP derivatives do not upscale or crop. Runtime/build never fetches remote product imagery. Labels/logos are not redrawn. The twenty-image contact sheet was visually inspected, including clothing mock-ups/lifestyle imagery and the song-provider illustration.

## Automated and responsive verification

- Strict build: 96 checked files, zero errors/warnings/hints, 90 Astro pages.
- Unit: 34 tests, including exact links, original-image hashes, ten-brand coverage, category mapping, market/event validation and synthetic 0/1/3/6-entry contracts.
- Image pipeline: two tests covering JPG/PNG/WebP/AVIF, byte preservation, dimensions/no upscaling and invalid intake rejection.
- Local scanner: 92 HTML pages, 7,152 local references, no missing asset/anchor, duplicate ID or indexable preview.
- Full Chromium regression: final photo-backed rerun after font-declaration reduction and six-image fixture extension passed 50/50 desktop/mobile tests in 1.4 minutes, no skipped tests or unexpected failures.

Homepage and actual 1/2/3-image profiles are exercised at 375/768/1024/1440px. Loaded images have positive natural and declared dimensions and computed `object-fit: contain`; no overflow above 1px or remote image requests. A six-card layout fixture clones verified cards only inside the browser test and checks all four widths; it is not six invented production products. Zero-image intake/schema and the previous text-only rendering remain tested; no production zero-image brand is claimed after onboarding all ten.

Real image/title/button affiliate clicks each produce one event with the correct featured ID and placement; internal exploration produces none. EN/DE/FR axe, native no-JS destinations, menu, Finder/history, consent, expired-offer and Halloween/Christmas/Black Friday regressions are retained. Storage/asset failures do not prevent browsing. No unconfigured tracker, console/CSP violation or third-party decoration request was observed in tested routes.

Visual references: `official-photos-home-{width}.png`, `official-photos-one-{width}.png` (DE service), `official-photos-two-{width}.png` (FR lamps), `official-photos-three-{width}.png` (GB cosmetics), refreshed `brands-directory-{width}.png`, and `brand-official-image-board.png`. Desktop/mobile home, cosmetics and lamps captures were inspected; no packaging crop or stretched image. Written historical reports remain unchanged apart from a follow-up pointer; captures can reflect the latest regression build.

## Mobile lab performance — acceptance not fully met

Three independent cold-profile runs per batch. Homepage explicitly enables Effects and verifies Lottie JSON loading. Directory/profile decorations are intentionally static. No browser regression suite ran concurrently with these audit batches; the font-optimisation batch overlapped a short unit/pipeline check, so this is local lab evidence, not field certification.

| Photo-backed page / batch | Performance | Accessibility / BP | LCP runs, ms | Median LCP, ms | Maximum CLS |
|---|---|---|---|---|---|
| Home, initial | 96 / 97 / 96 | 100 / 100 | 2558.462 / 2556.544 / 2554.732 | 2556.544 | 0.000035111 |
| Home, reduced unused font declarations | 96 / 96 / 96 | 100 / 100 | 2558.990 / 2559.974 / 2558.841 | 2558.990 | 0.000035111 |
| Directory, before font-only reduction | 98 / 98 / 98 | 100 / 100 | 2335.832 / 2260.859 / 2335.398 | 2335.398 | 0.000035111 |
| Cosmetics profile, before font-only reduction | 99 / 99 / 99 | 100 / 100 | 2102.448 / 2104.429 / 2104.432 | 2104.429 | 0.000035111 |

P>=90/A>=95/CLS<=0.1 pass in these batches. **Homepage median LCP remains about 2.56s, above the 2.50s gate. Full performance acceptance is not completed.** The measured largest element is the existing Halloween hero SVG, not a brand gallery photo. The real-photo directory/profile batches pass their median LCP target.

Unused Cyrillic/Greek/Vietnamese font declarations were removed while retaining Latin/Latin Extended, weights and italic for EN/DE/FR. Compressed home HTML decreased from 21,069 to 20,767 bytes; this did not solve LCP. A trial 350ms decoration quiet window also did not help (median2557.257ms); it was reverted. A pre-rendered texture trial added 33KB and worsened LCP (median2634.762ms); code/generated asset were removed. A synchronous hero SVG decode trial did not help (median2558.667ms); it was reverted. Do not cherry-pick these trials as a passing final audit or disable Effects to hide the issue.

Raw ignored summaries use labels `official-photos-home-on`, `official-photos-home-optimised-on`, `official-photos-home-final-on` (quiet-window trial), `official-photos-home-texture-on`, `official-photos-home-sync-on`, `official-photos-directory`, `official-photos-profile`. The name `final-on` describes a historical trial, not the retained runtime. SEO66 reflects deliberate noindex; TBT is not field INP. No physical-device, Firefox/WebKit, deployed-header, RUM or payout certification is claimed.

## Handoff and remaining gates

Local preview: `http://127.0.0.1:5180/en-gb/#women-products`. [Operator guide](../brands.md) explains source intake, optional downloader, offline derivatives, event/category ordering and pausing/rollback. Image work is delivered; homepage LCP optimisation remains tracked rather than falsely completed. Confirm programme/creative rights, pending destinations, regional Toybox kit and human translations before any public launch. No push, commit, deploy or public indexing was performed.
