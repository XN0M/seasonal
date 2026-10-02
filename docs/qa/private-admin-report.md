# Private admin and affiliate redirect QA — 2026-10-02

## Scope and result

Local implementation and isolated verification pass. No remote resources were created, no commit/push/deploy was performed, and no ads were run. `wrangler deploy --dry-run` only bundled code; it did not publish. The real Worker keeps admin closed (403) without actual Access/owner configuration. The temporary test harness is loopback-only, test-only and not deployed.

Implemented: Vietnamese admin, constrained brand/event drafts, immutable campaign links, live pause/resume/archive, native website wrappers, minimal redirect statistics, immutable publication/revision verification, editorial promo template, export and restore-to-draft rollback.

## Automated evidence

- Strict Astro/TypeScript: 127 files, zero errors/warnings/hints.
- Vitest: 58/58 unit/integration tests (including real in-memory SQLite SQL, ephemeral RS256 signatures, JWKS fixtures, CSRF, owner/bypass rejection, destination identity, one-job concurrency, callback revision confirmation and isolated restore).
- Image pipeline: 2/2; original 20 merchant images and provenance retained.
- Frontend/landing E2E: 62/62 mobile/desktop; three locales, four widths, axe, no-JS native links, exactly one browser affiliate intent, internal Explore emits none, Finder URL/history, consent and Halloween/Christmas/Black Friday.
- Private admin E2E: 2/2 isolated owner-token fixture tests; five screens, locale edits, draft versions, event selection, campaign creation, immediate pause and accessible forms at 375/768/1024/1440.
- Source-only build after QA reset: 90 routes; 92 HTML pages, 10,147 local references, all noindex, no missing references/anchors or duplicate IDs. Fixture build also passed: 95 HTML, 10,342 references.
- Worker dry-run (final bundle): 884.87KiB uncompressed /151.04KiB gzip. Private HTML/JS/CSS embedded in the Worker, not exposed in static dist. No unsafe-inline/eval in admin CSP. Real local Worker rejects private/encoded namespace and build API access without auth.

First browser trials caught an obsolete direct-merchant href assertion and a form-label selector issue. Expectations were updated for wrappers while still asserting the exact final original merchant URL and one event; labels now have explicit accessible names. Final full suites passed. These were not waived failures.

## Redirect benchmark

100 sequential real local Worker/D1 requests, redirects not followed, original Location checked every time. Final p95 **22.91ms**, median15.19ms, max75.12ms. This is local response time including HTTP, not isolated CPU time, international latency or merchant page load. Earlier 100-request series p9520.35ms (median15.17/max147.56ms) and22.62ms (median15.29/max113.30ms) are also recorded here; no failing sample was excluded. There is still one extra network hop; zero-delay is not promised. QA benchmark user agent is excluded from estimated human clicks.

## Lighthouse — all three cold-cache mobile runs

| Page | Performance | Accessibility | LCP per run (ms) | Median LCP (ms) | Maximum CLS |
|---|---|---|---|---|---|
| Homepage, Effects explicitly on | 96 /99 /99 | 100 /100 /100 | 2555.646 /1871.925 /2099.597 | 2099.597 | 0.000035111 |
| Brand Finder | 98 /98 /98 | 100 /100 /100 | 2316.874 /2307.314 /2327.668 | 2316.874 | 0.000035111 |
| Editorial campaign landing | 97 /97 /97 | 100 /100 /100 | 2382.456 /2375.155 /2357.134 | 2375.155 | 0.000035111 |

All per-run Performance >=90/Accessibility >=95 and median LCP<=2500ms/CLS<=0.1 gates pass. Home run1 exceeds2500ms individually and is retained; the approved criterion is median. Homepage Effects-on includes actual Lottie JSON requests. Some public regression browsers were running concurrently during lab measurement; no favourable rerun was selected. Scores are local lab observations, not field INP or international performance guarantees. SEO66 is intentional under noindex; indexing was not enabled.

Raw JSON series/summary files are local ignored artifacts under `docs/qa/lighthouse-admin-*-mobile*.json`; the table preserves every reading in tracked text.

## Visual evidence and fixture cleanup

`admin-publish-{375,768,1024,1440}.png` and `admin-landing-{en-gb,de-de,fr-fr}-{375,768,1024,1440}.png` record the private UI and real-photo template. Mobile/desktop images were inspected: no overflow, labels/notes visible, photos contain packaging, no private UI links in public navigation.

One campaign `local-preview-cosmetics` was explicitly generated for local QA, not through real online Publish. After measurements, `src/generated/content.json` was reset to `local-source`, the exact local campaign row was archived, and the source-only site rebuilt. No customer campaign is advertised as published. A final projection test additionally confirms that Publish derives card link visibility from current live system/destination state, rather than stale draft or rollback state. Six source-only browser smoke cases passed after cleanup. No user/live data was deleted or overwritten. The archived QA row remains reserved, consistent with slug lifecycle.

## Security/publication limitations

Local tests verify application logic, not actual Cloudflare Access policy/Google MFA or owner login. Actual email, custom hostname, service audience/subject, approved D1 database, CI credentials and protected environment approvals remain required. No fake login mode was added to the deployed Worker.

Remote build/deploy/callback and recovery have not been exercised. Existing quality auto-deploy is disabled so it cannot overwrite managed content with source defaults. Publish configuration is absent; admin reports it explicitly. Lost/interrupted jobs require coordinated CI reconciliation before unlocking. Service callbacks cannot declare published until bound ASSETS reports the expected immutable revision.

UK/DE/FR p95<=300ms staging response target, provider disaster recovery, AdsBot access and advertising programme/platform review remain pending. Redirect totals are not pageviews, unique visitors, sales or commission. No third-party tracker or intermediate pixel was added. Operational provider logs are separate from the minimized D1 event schema and require a launch privacy review.

Runbook: `docs/private-admin-operations.md`. Preview: `http://127.0.0.1:5181/en-gb/` (Worker/D1, not the old Astro-only preview).
