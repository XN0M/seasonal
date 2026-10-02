# Custom affiliate links — A to B — 2026-10-02

Implementation is local only. No commit, push, remote migration/resource creation or deployment. The owner can paste an affiliate URL for a brand outside the public catalog and create a live-on-current-backend `/r/{slug}` without publication. Immediate 302, no interstitial/assets/pixels; counts redirects, not pageviews or conversions.

## Changes

- Migration 0003 adds brand/custom target kinds and nullable brand references only for custom destinations. Existing IDs/slugs/statuses/expiry/campaign metadata and statistics are copied unchanged; immutable target and final archive constraints retained. Seed uses explicit columns and never resets pauses. Actual local database privately exported before upgrading, ignored `.wrangler/tools/pre-custom-backup.sql`.
- Custom API defaults label to slug, channel to other, no expiry; legacy brand input remains accepted. HTTPS lexical target validation rejects credentials, literal IPs/local hosts, self-domain/Worker aliases, control characters and unencoded characters without rewriting attribution. Additional own aliases configurable via `REDIRECT_SELF_HOSTS`.
- Admin defaults to paste mode; full original A/full B, copy (uses real clipboard in app; mocked in fixture tests), immediate pause/resume/archive, original brand/landing mode retained. URL/stat text wraps at mobile widths. Dashboard uses custom hostname/campaign; no synthetic public brands.
- Custom rows are excluded from immutable content snapshots/campaign landing build. Content schema remains version 1; backup export becomes schema version 2. Runtime statistics stay best-effort with existing automation heuristics and 30/365-day retention; no new visitor fields or trackers.

## Evidence

- Vitest: **102/102 tests pass**, including final corruption/rollback assertions.
- Upgrade test starts with migrations 0001/0002 and populated paused/archived links, draft and raw/daily statistics, then applies 0003 and reseeds; exact equality, foreign-key integrity and constraints verified. Separate export/restore includes original custom A and preserved live pauses.
- API tests cover owner/CSRF, 25 invalid target examples, exact encoded query/fragment, duplicate/concurrent slug, legacy/custom namespace conflict, immutable target, expiry, HEAD/no count, method/error statuses, query isolation, best-effort statistics failures, publish exclusion and rollback preserving custom pause.
- Admin browser: three tests pass, including create/copy/custom statistics, keyboard activation, pause/resume/archive/duplicate error retaining form values. Axe, overflow and target checks at 375/768/1024/1440. Password browser setup/login/private admin/logout also passes.
- Public regression: **60 passed, 2 skipped**, no failures. Both skips require a published static campaign landing, absent in baseline local content. Separately, an isolated 93-route published-landing build and real Worker/D1 run **4/4 browser checks**, covering both skipped landing scenarios on mobile/desktop, all three locales/four widths/axe/exact legacy affiliate wrapper. Do not combine these as a single 62/62 batch. Fixture JSON/build/database never replace the baseline source snapshot, owner main dist or owner data.
- Build: final strict check **138 files, zero diagnostics**; normal build 90 Astro routes; static link/noindex check: 92 HTML pages and 10,147 references. Two image pipeline tests pass. Worker deploy **dry-run only**: 907.28 KiB / 156.99 KiB gzip.
- Actual isolated Wrangler on 5394 with real local D1 and fixture owner/password session: create/unlisted target, CSRF, duplicate, exact Location/query preservation, 302 empty body, HEAD/405, 100-request statistics, pause/resume/archive, self/IP refusal, export and logout pass. No actual owner password entered or changed. Runtime fixture does not modify owner database.
- `custom-link-runtime.json`: 100 sequential GETs, p95 **20.595 ms**, median **15.057 ms**, max **41.395 ms**; all responses valid. Metric is local end-to-end HTTP, includes a network hop, not international latency, merchant load or a production security claim. Headless QA requests contribute raw request count but not estimated human clicks.

## Visual review and limitations

Four full-page and form screenshots saved as `custom-links-{width}.png` and `custom-links-form-{width}.png`; mobile form inspected at original resolution, wrapping and distinct A/B actions reviewed. Published-landing screenshots cover EN/DE/FR at all four widths. Initial sandbox browser launch was blocked; its local fixture was stopped before successful permission-approved Chromium rerun. No browser permission issue is represented as a product failure/pass. Initial isolated Astro QA config used a URL object for outDir and was rejected by Astro 7; corrected to an absolute string, subsequent isolated build passed.

Validation is lexical: it does not verify domain DNS, availability, merchant redirects or programme/ad-channel approval. Encoded HTTPS URLs and DNS-style hostnames on standard HTTPS port only; literal public IPs are also refused. A merchant may add its own hops after Seasonal Edit; we cannot guarantee merchant behavior.

New links copied locally use `127.0.0.1:5181`, not public `evenal.click`. Public activation still needs separately approved existing Worker/D1/secrets/migrations/deploy and online checks. No fresh Lighthouse run was needed for this private admin/server-only extension; historical Lighthouse numbers are not reported as new measurements. Two baseline published-landing skips were covered separately using isolated static fixture content, not production publication.

### Isolated landing regression reproduction

Create ignored fixture JSON with `ALLOW_LOCAL_CONTENT_FIXTURE=true node scripts/admin-tools.mjs landing-fixture`; build with `astro build --config scripts/astro-landing-qa.config.mjs`; generate manifest with `node scripts/admin-tools.mjs landing-manifest`. Prepare/seed only `.wrangler/custom-link-runtime` using D1 migrations plus the generated normal seed. Generate `landing-seed` under the same fixture opt-in and import `.wrangler/tools/fixture.sql` ONLY with `--local --persist-to .wrangler/custom-link-runtime`. Run `npm run test:e2e -- --config playwright.landing.config.ts` (port 5394 must be free). This config serves `.wrangler/landing-qa-dist` only; authentication tests assert logged-out private paths remain protected. These are test campaign fixtures, never real ads/campaign publication.

## Operation

Open local admin, sign in, select Links → Dán link affiliate mới, paste A, enter unique slug, select Tạo link B and copy B. Optional label/channel/expiry available. To change A create a new slug; to stop traffic select Pause ngay. Archive is irreversible and does not free the slug. No content Publish required. Online URL form is `https://evenal.click/r/{slug}` only after approved deployment, not activated here.
