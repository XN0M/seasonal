# Site-wide brand affiliate operations — 2026-10-01

## Current edition

Local EN/DE/FR preview. Ten owner-approved brand links, twenty retained official catalog images, nine localized guide bodies. No commit, push, public deployment or indexing is authorised by this work. Programme permission and image permission are owner-confirmed, not an independent shipping or commission certification.

## Source of truth

- `src/data/brands.ts`: original affiliate URLs, approval/date/display locales, recipients, sources, delivery checks and restrictions, featured examples and event priorities.
- `src/lib/brands.ts`: HTTPS/host/tracking/status/actual-expiry validity, independent fulfilment notice and confidence ordering. Do not change the product Offer checks in `src/lib/affiliate.ts` to enable a brand link.
- `src/lib/brand-finder.ts`: brand filters, compact server-rendered contracts, migration and shareable history; no price fields. src/lib/brand-finder-client.ts controls native filters over retained server-rendered cards, without a React hydration bundle. This performance-driven implementation replaces the initial idle-island experiment. The older product Finder engine remains for product-offer validation tests, not public recommendations.
- `src/content/guides/`: English masters plus DE/FR Markdown. Public slugs stay identical; internal IDs include locale. `status: review` is intentional, not native/legal approval.
- `assets/brand-images.json` and `docs/assets/brand-image-provenance.json`: original image ownership confirmation, source, date, hashes and mappings. Image processing keeps originals and produces responsive local assets without changing logos/labels.

## Pause and restore a link

Set the corresponding link `status` to `paused`, rebuild, and rerun unit/build/link/browser checks. Invalid shopping links disappear from ready-only Finder/event/home selections and render disabled on their introduction/directory card where appropriate. Pausing a profile or merchant also disables the link. An expiry is optional: add one only when it is a real programme condition. Never fabricate one to satisfy an Offer schema.

Restore `active` only after reviewing the source programme status. Keep the supplied `ref`, `rfsn`, UTM and Shopify hostname untouched. `Explore brand` stays an internal route and emits no affiliate event. Product examples deliberately use the same brand-home affiliate URL rather than pretending to deep-link to a SKU.

## Change event ordering

Change `activeEventId` in `src/data/campaign.ts` and rebuild. Homepage/Gifts order by the configured event but retain recipient-appropriate alternatives. A hub and an explicitly event-filtered Finder use only IDs in that event’s priority list. Update `brandEventPriority` in `src/data/brands.ts` only with a genuine editorial fit; never fill Halloween with unrelated brands.

Within the filtered set, verified fulfilment comes before unknown, then known restrictions, then event rank and name. The selected Finder country changes notes and order, not programme permission. World of Cosmetics remains browsable from DE/FR with its recorded UK-only delivery restriction visible. SchenkDeinLied is described as a German-language digital service, not physical shipping.

## Finder compatibility

Four criteria: recipient, interest, occasion and country for delivery checks. User choices create history entries; popstate restores them. Initial normalization uses replaceState. Legacy `budget` is removed with a notice; `accessories → fashion`, `toys → creative`, `family → home`. UTM and hash remain. Empty intersections require an explicit filter change; no silent relaxation.

Without JavaScript, ten server-rendered brand results, disclosure, notices and native shopping/internal links remain. Interactive filtering needs JavaScript. No storage is required for the filters. Decoration/storage failures do not affect shopping links.

## Verification and rollback

Run `npm test`, `npm run test:images`, `npm run build`, `npm run test:links`, `npm run test:e2e`. Keep screenshot/Lighthouse evidence in `docs/qa/`; audit homepage with Effects on, three cold-cache runs for every required page type. Preserve failing experiments as well as the final measurements.

For rollback, restore only the affected source/data edit from a retained verified artifact or version, preserving unrelated local changes. Rebuild and repeat checks before replacing the local preview. Do not use a destructive Git reset. A previous edition that gated links on shipping is a different policy; restoring it must be an explicit editorial decision.

Public release, domain/hosting, native/legal review, analytics dashboards, programme attribution and actual orders/commissions remain separate. Local link availability is not proof of merchant delivery, a current deal or financial performance.
