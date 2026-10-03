# Seasonal Event Affiliate Hub — Implementation tracker

## Admin slug validation hotfix — 2026-10-03

- [x] SH-01 — Accept valid custom link slugs consistently and explain invalid input.
  - Report (2026-10-03): Owner screenshot showed browser rejecting `epres2026`, though the server schema accepts it. Removed the native pattern attribute from the admin form, normalize typed uppercase/outer whitespace, and validate against the same slug grammar with a Vietnamese error on submit. Existing server validation and link identity rules remain. Browser regression covers `epres2026D` → `epres2026d`, valid `epres2026`, invalid trailing hyphen, custom redirect creation, four widths and accessibility; 3/3 admin UI tests pass. Strict Astro check/build: 139 files, zero diagnostics, 90 pages. Direct Worker deploy succeeded at version 8d53d7ec-bf88-47c9-888a-46ff75fd240a. Screenshot fixture outputs restored to pretest baseline. No credential or affiliate target changed.

### Hotfix completion report
- Status: Deployed and synchronized to GitHub main.
- Completed: SH-01.
- Evidence/tests: 3/3 admin browser tests, zero type diagnostics, successful build and Worker deployment.
- Visual review: Existing admin layout unchanged; native generic pattern popup replaced by Vietnamese validation; screenshot baseline preserved.
- Known issues: Owner should refresh the open admin tab before retrying; no real custom link created by QA.
- Decisions/deviations: Kept the 4–64 length and server slug grammar; only input normalization and feedback changed.
- Next phase readiness: Can retry creating B with `epres2026` after a refresh.

## Cloudflare D1 deployment configuration — 2026-10-02

### Online activation follow-up — owner approved continuation

- [x] CF-O01 — Authenticate operator to the confirmed Cloudflare account and inspect remote D1/Worker before writes.
  - Report (2026-10-02): Initial OAuth login reached the wrong account and was stopped before writes. Owner reauthenticated as the account containing Worker seasonal and D1 ID 9e596acb-c807-4b53-9166-210c1a0932b4. Live `wrangler d1 info` exposed the actual name `sesonal-admin` (earlier screenshot had been read as `seasonal-admin`), with zero tables. Corrected provider config, remote init script, test and runbook to the real name while retaining local D1 identity. Worker seasonal exists; secret list initially empty. Local build/strict check and 92 HTML/10,147 references/noindex checks pass.
- [x] CF-O02 — Backup when non-empty, apply migrations/idempotent seed and provision server secret/owner credential privately.
  - Report (2026-10-02): Remote D1 had zero tables/rows before migration, so no live content required backup. Three migrations and idempotent seed succeeded; read-only counts after seed: 10 destinations, 10 system links. Random 32-byte CSRF_SECRET uploaded to Worker seasonal without displaying value. Owner privately prepared a new password; initial hash SQL import failed because D1 rejected explicit BEGIN/COMMIT and wrote nothing. Fixed generator to omit explicit transaction statements, preserved the prepared hash, then import succeeded; read-only query confirmed one owner email/version 1. Private SQL remains ignored; no local sessions copied or exposed password reused.
- [x] CF-O03 — Deploy reviewed existing Worker and verify online login, rejection and redirects; report remaining publication/security gates.
  - Report (2026-10-02): Direct deploy of Worker seasonal succeeded at version d952c013-2e9c-423a-b8e9-87491a97cbad, bound to sesonal-admin. Online homepage 200/noindex, login 200/noindex, unauthenticated admin 303 to login, protected bootstrap 401, auth status configured=true/setupAvailable=false, system affiliate redirect 302 with original URL/no-store; remote click-event rows observed. Owner confirmed interactive login succeeded using their newly chosen password. 104/104 unit/integration tests and 92 HTML/10,147 local link/noindex checks pass. Config/helper changes pushed to GitHub main at c6ea8f6; connected Cloudflare build still needs its own success check. Managed Publish/CI remains separately unconfigured.

### Online activation report
- Status: Admin login and brand redirects operational on evenal.click; source synced to GitHub main.
- Completed: CF-O01, CF-O02, CF-O03.
- Evidence/tests: Live provider ID/Worker verification, all three migrations, seeded D1 counts, secret-name check, owner D1 email read, user-confirmed login, live 200/303/302/noindex checks, 104 tests, link checks.
- Visual review: Owner accessed the online admin; no new public layout changes in this phase.
- Known issues: Managed content Publish requires separate CI/service identity setup; edge rate limits, backup recovery and cross-region redirect latency are not yet verified.
- Decisions/deviations: Actual D1 name is sesonal-admin. D1 rejected explicit transaction statements in credential import; generator corrected and import retried successfully without changing the chosen password. The initial wrong Cloudflare account was not written to.
- Next phase readiness: Links admin can be used online; confirm user-created custom redirect and synchronize GitHub source before relying on connected builds.

Owner screenshot confirms D1 `seasonal-admin`, ID `9e596acb-c807-4b53-9166-210c1a0932b4`, currently zero tables. Existing deployed Worker is `seasonal`; deploy log 10181 identifies the former all-zero local D1 ID as the blocking error. Configuration update only; no remote migration, credential provisioning, push or deployment authorized in this follow-up.

- [x] CF-A01 — Point default deployment to the confirmed Worker/D1 and isolate the original local binding/state.
  - Report (2026-10-02): Default config now selects Worker seasonal and the confirmed seasonal-admin UUID. Non-secret password-mode/origin/owner settings added, remote first setup disabled; secrets remain outside source. Local env preserves original Worker name/all-zero LOCAL binding, and all preview/migration/reset/landing-QA commands select it explicitly. Managed config generation retains the reviewed Worker name, optionally overridden by CF_WORKER_NAME, instead of inventing an environment suffix.
- [x] CF-A02 — Verify local account survives, config/dry-run/unit checks, and document safe remote initialization gates.
  - Report (2026-10-02): 104/104 tests pass, including new binding/local-isolation regression tests; strict check 139 files/zero errors/warnings/hints; default and local Worker deploy dry-runs pass (907.28 KiB/156.99 KiB gzip), git diff --check passes. Restarted only the owned preview with --env local: auth/status remains configured=true/setupAvailable=false without reset or credential access. Runbook documents explicit remote migrations/idempotent seed command, provider secret and private hashed-password provisioning before deployment. Remote D1 still zero tables per screenshot; Wrangler is unauthenticated, and no remote command, login, push or deployment was performed. Dry-run does not prove online binding/account/auth readiness.

### Configuration fix completion report
- Status: Complete locally; online initialization and deployment pending separate authorization.
- Completed: CF-A01, CF-A02.
- Evidence/tests: 104 unit/integration tests, strict Astro check, both deploy dry-runs, live local auth-status check, clean whitespace diff.
- Visual review: No UI/layout changes; existing local account/preview preserved at port 5181.
- Known issues: Remote schema/seed/owner credential/CSRF secret and actual deployment are not initialized or verified. Managed publication CI/service identity still needs separate setup.
- Decisions/deviations: Keep original local state under explicit env.local; no automated remote migration during build/deploy, no credential or private local database import. Connected Cloudflare builds can deploy after push, so pushing requires approval.
- Next phase readiness: Ready for approved Cloudflare initialization and configuration push; not yet an operational online admin.

## Custom affiliate links — A to B — 2026-10-02

Local implementation only. Owner pastes A, creates B, and B returns an immediate 302 to A. No interstitial or pageview claim; custom links do not require a public brand or content publish. Preserve all previous reports below.

### Phase A — Data and resolver
- [x] CL-A01 — Add brand/custom contracts and lossless migration, preserve existing links/statistics.
  - Report (2026-10-02): Added discriminated link contracts and migration 0003, preserving IDs/slugs/statuses/expiry/drafts/raw/daily statistics. Populated pre-upgrade database test, foreign-key checks, archived/immutable constraints, idempotent reseed and isolated export/restore pass. Actual owner local database privately backed up to ignored .wrangler/tools/pre-custom-backup.sql before upgrade; no credential changed. Managed content stays v1; export becomes v2.
- [x] CL-A02 — Validate owner-managed HTTPS targets and resolve immediate redirects.
  - Report (2026-10-02): Custom resolver preserves original A in 302/no-store/empty-body response, with no merchant fetch or intermediary UI. 25 unsafe-URL cases, encoded attribution/fragment, query isolation, concurrency, expiry, corruption/DB/statistics failure and state transitions tested. Only lexical public-host validation; DNS availability and downstream merchant hops not claimed. Literal IPs and nonstandard ports refused; additional own aliases configurable.

#### Phase A completion report
- Status: Complete locally.
- Completed: CL-A01, CL-A02.
- Evidence/tests: 102 unit/integration tests, populated migration/export/restore tests, actual local D1 migration and isolated real Worker resolver checks.
- Visual review: No public layout change; schema/resolver-only phase.
- Known issues: DNS/reachability, affiliate/ad permissions and online hosting not verified by URL validation.
- Decisions/deviations: Preserve URL rather than normalize it; reject unencoded Unicode/spaces, all literal IPs and nonstandard ports. No public profile required.
- Next phase readiness: Brand/custom links share one globally unique slug namespace and safe live status controls.

### Phase B — Admin and dashboard
- [x] CL-B01 — Paste-link form, copy full URL, live status and meaningful custom-link statistics.
  - Report (2026-10-02): Default paste mode accepts A/slug with optional campaign/channel/expiry and no locale/market/event. Cards show original A, full current-origin B, copy and live pause/resume/archive. Custom statistics use hostname/campaign with nullable brand; no visitor/pageview claim. Three browser tests pass including keyboard, mocked clipboard copy, duplicate error preserving input, axe/overflow/48px targets at 375/768/1024/1440; password browser regression passes. Form/mobile screenshots reviewed.
- [x] CL-B02 — Exclude custom links from public content/landing publication; update operating instructions.
  - Report (2026-10-02): Publish selects brand rows only and removes admin-only presentation fields from content snapshots. Existing brand request contract and landing flow preserved; custom pause survives rollback. README/runbook updated with usage, backup v2, alias settings and explicit local-vs-online scope. No new tracker, catalogue entry or fake affiliate approval.

#### Phase B completion report
- Status: Complete locally.
- Completed: CL-B01, CL-B02.
- Evidence/tests: Admin 3/3 and password 1/1 browser tests; unit publication/exclusion/rollback assertions.
- Visual review: Four widths/axe/overflow pass; custom-links-form-375.png inspected at original resolution, A/B text/actions distinct and wrapped.
- Known issues: Local copies loopback URLs; evenal.click requires separate deployment. Ad-channel permission is not inferred from creation.
- Decisions/deviations: New mode has no landing or publication requirement; existing brand mode retains optional landing flow. Real clipboard used in app, mocked only in QA.
- Next phase readiness: Link creation/state/statistics usable without changing the public frontend.

### Phase C — Verification and handoff
- [x] CL-C01 — Migration/export/restore, auth/API/unit, browser/accessibility and existing-link regressions.
  - Report (2026-10-02): 102/102 unit/integration, 2/2 image, 3/3 admin browser and 1/1 password browser pass. Public batch: 60 pass/2 unpublished-landing skips; separate isolated published-landing build/Worker/database runs 4/4 browser checks, including the two previously skipped landing scenarios, all locales/four widths/axe/exact wrapper URL. Baseline source snapshot and owner dist/database remain unchanged by this fixture. Final strict check 138 files/zero diagnostics; normal build 90 routes, 92 HTML/10,147 references/noindex checks pass; Worker dry-run 907.28 KiB/156.99 KiB gzip. Initial sandbox launch blocked; successful permission-approved browser reruns recorded separately.
- [x] CL-C02 — Actual local Worker verification and 100-request timing; handoff without push/deploy.
  - Report (2026-10-02): Actual isolated Wrangler/D1/password-session setup/create/custom 302/CSRF/duplicate/HEAD/405/statistics/pause/resume/archive/export/logout pass. 100 sequential GETs: p95 20.595ms, median 15.057ms, max 41.395ms (local end-to-end HTTP, not international/CPU-only/merchant load). Authenticated owner credential was not entered or changed. QA fixture services stopped; owner preview remains on 5181. Runtime JSON, screenshots and custom-links-report.md saved. No commit/push/remote migration/deploy.

#### Phase C completion report
- Status: Complete for local custom-link handoff; online activation remains a separate task.
- Completed: CL-C01, CL-C02.
- Evidence/tests: Unit/image/admin/password/public regression, isolated published landing and real Wrangler runtime evidence above; private backup and fixture export/restore verified independently, never restored over live data.
- Visual review: Custom form/cards four widths; published brand landing EN/DE/FR four widths; no public design change.
- Known issues: Baseline public batch still correctly reports two skips; those scenarios pass separately on isolated published fixtures. No new Lighthouse or international measurement claimed. Remote auth/domain/database/ad readiness remain unverified.
- Decisions/deviations: Additional isolated Astro alias config/landing fixture tests avoid overwriting source snapshot, owner catalog, main dist or database. Host validation is lexical; no destination network check per click.
- Next phase readiness: Refresh http://127.0.0.1:5181/_manage/, sign in, Links → Dán link affiliate mới → paste A/slug → Tạo link B → copy B. Online evenal.click activation requires separate approval.

## Single-owner password login — 2026-10-02

### Owner-requested length policy follow-up — 2026-10-02

- [x] PW-D01 — Remove the 15-character minimum consistently in setup, hashing and operator reset.
  - Report (2026-10-02): Setup UI, server hashing, error text and operator reset now accept 1–128 characters and reject empty input. 68/68 unit/integration tests pass, including one-character setup/hash/reset; 1/1 browser setup/login/logout/axe flow passes with a short fixture password. Actual 5181 login script verified updated. Existing owner credentials/session/CSRF/throttling unchanged; owner informed of risk, docs mark former 15-character wording historical. No push/deploy.

#### Password-length follow-up completion report

- Status: Complete locally.
- Completed: PW-D01.
- Evidence/tests: 68 unit/integration tests, one short-password browser flow, actual preview script check.
- Visual review: Login four widths/axe/overflow pass; no layout change.
- Known issues: Short passwords are easier to guess; existing online activation gates remain.
- Decisions/deviations: Owner explicitly requested removal of the recommended minimum; empty passwords remain invalid and maximum 128 retained.
- Next phase readiness: Refresh local login and choose a non-empty password. No password altered or remote rollout performed.

Owner chooses native email/password login instead of Access for the human admin. Build-service Access remains separate. Local implementation only; no remote database, push or deployment. Never reuse the password disclosed in chat. Public site and redirects remain unauthenticated.

- [x] PW-A01 — Credential/session migration, slow salted password hashing and login throttling.
  - Report (2026-10-02): Migration 0002 adds single-owner credentials, keyed-hash sessions and atomic five-attempt/15-minute limiter. Native scrypt N=16384/r=8/p=5 with random salt; one-hour HttpOnly/Strict/host-only sessions; HTTPS Secure cookie. All 67 unit/integration tests pass, including concurrent reservations, expiry, credential reset and wrong host/email.
- [x] PW-B01 — Vietnamese login, loopback-only first setup, owner session verification, CSRF and logout.
  - Report (2026-10-02): Native login UI, local-only first-password form, exact-owner verification and revoking logout added. One password browser flow passes setup/login/wrong password/keyboard/logout and axe at four widths; two previous Access admin regressions pass. Actual isolated Wrangler runtime setup/login/CSRF/logout passes (login HTTP 193.4ms, local only). Real owner credential not created by the agent; awaits password entered privately by owner.
- [x] PW-B02 — Secure operator password reset and updated provider/runbook configuration.
  - Report (2026-10-02): Masked PowerShell/stdin credential tool with prepare-only mode added; isolated reset test verifies salted hash, version increment and session revocation. Runbook/provider/CI updated; native mode does not require human Access, build-service Access unchanged. Ignored .dev.vars contains owner configuration/random session secret, never a plaintext password. No remote mutation.
- [x] PW-C01 — Unit/auth integration, browser keyboard/accessibility and actual local Worker verification.
  - Report (2026-10-02): 67/67 unit/integration +2/2 image +1/1 password browser +2/2 Access admin browser tests pass; strict check 133 files/zero diagnostics; build and 10,147-reference/noindex check pass; actual isolated Worker auth and dry-run pass. Public batch: 59 passed, 2 unpublished-landing skips, 1 mobile gallery failure during the period of concurrent building; explicit unchanged post-build rerun of the failing case passed. Original batch is NOT recorded as a clean full pass. Four login screenshots saved and mobile visually reviewed. Full details in docs/qa/password-login-report.md.

#### Completion report
- Status: Local password implementation/targeted auth QA complete; owner password entry and online activation pending.
- Completed: PW-A01, PW-B01, PW-B02, PW-C01.
- Evidence/tests: 67 unit/integration, 2 image, 1 password browser, 2 Access admin browser; actual isolated Worker setup/login/logout/CSRF; strict check/build/link/noindex and dry-run. Public batch retained as 59 pass/2 skip/1 failure; failed case passes explicit rerun, not a falsely clean batch.
- Visual review: Login 375/768/1024/1440, axe/overflow pass, 375 screenshot inspected. Private UI does not change public layout/JavaScript.
- Known issues: Online Worker/D1/secret/edge rate limiting/CPU budget and HTTPS session checks remain separate; password-only is not MFA. Account-wide throttle permits temporary denial of access. Cause of initial gallery failure not conclusively proven; no source change needed for post-build rerun.
- Decisions/deviations: Explicit password mode; no public registration, no remote bootstrap route, no silent fallback to Access.
- Next phase readiness: Owner may enter a NEW password privately at http://127.0.0.1:5181/_manage/login/ and use local admin. No actual owner credential chosen by agent, no production login claim, push or deploy.

## Private admin and affiliate redirects — 2026-10-02

Scope: local Worker/D1 implementation, static public frontend, owner-only Access authentication. No remote resources, commit, push, deployment or ads. Production auth/CI and international latency cannot be verified without owner/provider configuration.

### Phase A — Foundation and access
- [x] AD-A01 — Worker routing, D1 migration and idempotent seed.
  - Report (2026-10-02): Worker-first static-asset routing; real local D1 migration and idempotent ten-brand seed added. SQLite integration and Wrangler local migration/seed pass; seed preserves pauses/draft versions.
- [x] AD-A02 — Signed Access JWT, exact owner, CSRF, private assets/API and fail-closed configuration.
  - Report (2026-10-02): RS256/JWKS verification pins issuer, audience, exact owner email, token lifetime and origin; Origin/CSRF/body limits and private CSP/no-store added. Fake/expired/wrong-email/audience/header-only/bypass requests rejected in isolated tests; actual Google/MFA/Access configuration remains an online activation gate.
- [x] AD-A03 — Contracts, audit and separate environment configuration.
  - Report (2026-10-02): Typed contracts, immutable slug/brand target/revision triggers, audit records, private assets bundled only in Worker and separate env inventory added. Strict check passes; no admin HTML/script in dist, no secrets committed.

#### Phase A completion report
- Status: Complete for local implementation/verification only; online gates pending.
- Completed: AD-A01–AD-A03.
- Evidence/tests: Signed JWT/CSRF/host and idempotent D1 tests; local migration/seed; strict check.
- Visual review: Data/security phase, no frontend layout change.
- Known issues: Actual Access/Google MFA and owner email not configured.
- Decisions/deviations: Private assets embedded in Worker rather than public/dist; all assets run through Worker-first routing.
- Next phase readiness: Ready for local admin fixture testing; remote activation separately gated.

### Phase B — Brand/Link/Event admin
- [x] AD-B01 — Vietnamese UI, localized copy and existing-image selection.
  - Report (2026-10-02): Vietnamese Overview/Brand/Link/Event/Publish UI with three-locale text forms and existing-image selection. Isolated synthetic-owner JWT fixture browser test and axe pass at 375/768/1024/1440; deployed Worker has no fixture authentication bypass.
- [x] AD-B02 — Campaign link lifecycle and immutable targets/slugs.
  - Report (2026-10-02): Create/copy campaign, pause/resume and final archive implemented; arbitrary destinations and duplicate/reserved/reused slugs rejected. Target identity is immutable; live pause immediately returns 410. Links are not falsely called ads-approved.
- [x] AD-B03 — Optimistic draft concurrency, event order and history.
  - Report (2026-10-02): Draft optimistic versions, event membership-preserving reordering, revision/audit history and unsaved-change warning implemented. Stale saves/rollback return 409 without overwriting content; human review remains pending.

#### Phase B completion report
- Status: Complete for local implementation/verification only; online gates pending.
- Completed: AD-B01–AD-B03.
- Evidence/tests: 2 isolated admin browser tests, form/link lifecycle/concurrency unit tests, axe four widths.
- Visual review: Five admin screens reviewed at four sizes.
- Known issues: Real owner login unavailable until approved provider setup.
- Decisions/deviations: Native private UI adds no React runtime to public pages; immutable shipping/source fields stay read-only.
- Next phase readiness: Local UI ready; no online auth claim.

### Phase C — Redirect and measurement
- [x] AD-C01 — 302 resolver and safe status/error handling.
  - Report (2026-10-02): GET/HEAD 302 preserves all ten original URLs; inbound query ignored, no merchant fetch or interstitial; 404/405/410/503 tested. Final 100-request real local benchmark p95 22.91ms including local HTTP; previous series20.35/22.62ms recorded in QA report. No international latency claim.
- [x] AD-C02 — Brand CTA wrappers without changing the Offer engine.
  - Report (2026-10-02): All BrandAffiliateLink placements and SSR/native Finder use stable /r/brand-* wrappers; Explore remains internal. Optional redirect/campaign IDs added to bounded browser intent payload; Offer/expiry engine preserved. 62 browser regressions pass including no-JS and exactly-one client event.
- [x] AD-C03 — Minimal statistics, automation classification, retention and dashboard.
  - Report (2026-10-02): waitUntil best-effort GET counting, automation estimation, 7/30-day Bangkok dashboard, 30-day raw/365-day daily retention and EN/DE/FR privacy added. Unit tests prove HEAD uncounted, stats failure cannot cancel redirect, no visitor identity/full URL stored, retention works; browser intent not ingested into server totals.

#### Phase C completion report
- Status: Complete for local implementation/verification only; online gates pending.
- Completed: AD-C01–AD-C03.
- Evidence/tests: Original Location checks across ten brands/three locales, 100-request Wrangler benchmark and full shopping regression.
- Visual review: Existing shopping layout unchanged; native wrappers work without JavaScript.
- Known issues: Estimated clicks are heuristic; best-effort writes may be lost. System metadata is declared, not visitor geography.
- Decisions/deviations: Browser intent and server totals intentionally separate; no new trackers.
- Next phase readiness: Ready for exact-revision publication integration.

### Phase D — Publishing and landing
- [x] AD-D01 — Immutable snapshots, dedicated workflow and served-revision confirmation.
  - Report (2026-10-02): Immutable revision/job pipeline and separate least-scope service audience added; CI fetches exact snapshot, builds/tests and deploys approved artifact; callback independently verifies served ASSETS revision. One active job, dispatch failure and stale revision tested. Wrangler dry-run passes; real GitHub/Cloudflare publication is unconfigured/unverified, not reported as published.
- [x] AD-D02 — Editorial campaign landing and paid-traffic checklist.
  - Report (2026-10-02): Real editorial promo template uses original brand copy/photos, fulfilment restrictions, disclosure and guide links; campaign CTA wrapper and paid-channel checklist added. Temporary local-only campaign tested in EN/DE/FR at four widths with axe/noindex; fixture reset and local link archived after QA. No customer campaign is published online.
- [x] AD-D03 — Rollback, export and operating instructions.
  - Report (2026-10-02): Owner export, restore-to-draft rollback and operations runbook added. Isolated second SQLite database restore preserves paused links; rollback never resumes live links. Legacy auto-deploy disabled to avoid overwriting managed revisions. Remote backup/restore is still an activation gate.

#### Phase D completion report
- Status: Complete for local implementation/verification only; online gates pending.
- Completed: AD-D01–AD-D03.
- Evidence/tests: One-job/revision/callback/dispatch/rollback tests; landing axe/screenshots; isolated export/restore; Worker dry-run.
- Visual review: Text-and-photo editorial landings reviewed in EN/DE/FR.
- Known issues: Actual CI environment/service identity, D1 provider backup and remote deployment not activated.
- Decisions/deviations: QA fixture only, subsequently reset and archived locally. Legacy auto-deploy disabled.
- Next phase readiness: Local code ready; remote rollout requires separate approval and secrets.

### Phase E — QA and handoff
- [x] AD-E01 — Unit, Worker/API, auth, browser, axe, CSP and link checks.
  - Report (2026-10-02): 58 unit/integration tests, 2 image tests, 62 frontend/landing browser tests and 2 isolated admin browser tests passed. Strict check zero diagnostics; restored source build 90 routes/92 HTML and 10,147 validated references; Worker dry-run CSP/private namespace checks pass. Final snapshot test confirms card visibility follows live system-link pause at publish; rollback cannot reactivate it.
- [x] AD-E02 — Four viewports and shopping/seasonal regressions.
  - Report (2026-10-02): Admin five screens and EN/DE/FR landing screenshots at 375/768/1024/1440; visual review completed. Finder/history/menu/consent and Halloween/Christmas/Black Friday regressions passed. Screenshot fixture demonstrates UI, not actual owner authentication.
- [x] AD-E03 — 100-request redirect benchmark, Lighthouse and isolated restore verification.
  - Report (2026-10-02): Final 100 redirects p95 22.91ms local; three cold-cache Lighthouse runs each for homepage Effects-on, Finder and landing: P96/99/99, 98/98/98, 97/97/97; A100 throughout; median LCP 2.100/2.317/2.375s, CLS <=0.000035111. Isolated export/restore verified. Real Access/CI/staging/ads gates remain pending; no push/deploy.

#### Phase E completion report
- Status: Complete for local implementation/verification only; online gates pending.
- Completed: AD-E01–AD-E03.
- Evidence/tests: 58 unit/integration +2 image +62 public browser +2 private fixture tests; benchmark/Lighthouse in docs/qa/private-admin-report.md.
- Visual review: 375/768/1024/1440 screenshots inspected; no overflow or seasonal/shopping regressions.
- Known issues: Production auth, international latency, remote recovery and advertising readiness are not verified.
- Decisions/deviations: All three Lighthouse readings retained, including homepage first LCP2.556s; the median2.100s passes. No indexing relaxed.
- Next phase readiness: Local handoff complete; online activation pending.

Current status: local implementation and QA complete; Access/CI/staging activation not performed. Source snapshot restored; preview noindex. No commit/push/deploy. Historical reports below remain unchanged.

### Owner setup follow-up — 2026-10-02
- [x] AUTH-S01 — Record the requested owner identity in local configuration.
  - Report (2026-10-02): Owner email and loopback admin origin recorded only in Git-ignored .dev.vars. No login password stored, no password authentication or authentication bypass added. This is identity configuration, not an activated login account.
- [ ] AUTH-S02 — Configure the approved hostname, Cloudflare Access application and Google identity provider.
  - Report: Pending — custom hostname, provider access, Access team/audience and secret-store configuration required. Only the exact owner email may be allowed; missing authentication configuration must continue to return 403. No remote resources or deployment performed.

Working name: **Seasonal Edit**. Preview policy: **noindex; approved brand affiliate links are active**. Historical reports below describe their original builds, not the latest state.

## Current work — Site-wide brand affiliate completion — 2026-10-01

Owner confirms all ten affiliate programmes and image-use approval. Approved brand browsing links are independent of shipping evidence; retain notices/restrictions. Local EN/DE/FR only; no commit/push/deploy, new merchant/event/tracker or invented prices.

| Phase | Current status |
|---|---|
| A — Approval, fulfilment and editorial data | Complete |
| B — Shopping pages | Complete |
| C — Brand Finder | Complete |
| D — Guides/localization | Complete for local; human review pending |
| E — QA/performance/handoff | Complete for local handoff |

### Phase A
- [x] SC-A01 — Record owner approval and preserve ten original referral URLs.
  - Report (2026-10-01): Owner-confirmed permission and all three display locales recorded in src/data/brands.ts. All 30 brand/locale combinations pass unit validation; referral domains and attribution unchanged.
- [x] SC-A02 — Separate brand-link validity from sourced fulfilment notices/restrictions; retain offer validation.
  - Report (2026-10-01): Updated types/schemas and src/lib/brands.ts. Unknown shipping no longer blocks approved links; sourced UK-only restrictions remain for DE/FR and digital notices differ from physical delivery. Product Offer validation unchanged; unsafe/paused/expired links remain blocked.
- [x] SC-A03 — Recipient tags and market/event ordering.
  - Report (2026-10-01): Applied agreed recipient matrix, verified/unknown/restricted ordering then event/name. Halloween matches only World of Cosmetics; children only Toybox. 38 unit tests pass, including migration/filter regressions.
#### Phase completion report
- Status: Complete.
- Completed: SC-A01–SC-A03.
- Evidence/tests: npm test — 38/38 passed; approval and fulfilment are separate contracts.
- Visual review: No layout changes in data phase; notice placement receives Phase E browser review.
- Known issues: Fulfilment remains unknown for some brands; displayed honestly, not treated as an invalid referral.
- Decisions/deviations: Approval is owner-confirmed, not a shipping guarantee.
- Next phase readiness: Data ready for shopping pages and Finder.

### Phase B
- [x] SC-B01 — Home, directory and profiles with approved links and fulfilment notices.
  - Report (2026-10-01): Kept four Women/two Family photo-backed slots and Visit/Explore. All ten directory/profile links open in EN/DE/FR; sourced/unknown/restricted fulfilment notices precede CTAs. Owner permission does not assert shipping. Unit/build/browser brand checks passed; final batch underway.
- [x] SC-B02 — Replace Gifts/event/campaign concept listings with real brands.
  - Report (2026-10-01): Replaced customer-facing ProductCard grids with recipient-filtered brand cards and max-three event picks. Hub/campaign filter actual event fit; Halloween only World of Cosmetics. Concept records retained solely for independent Offer/disabled-component QA. Browser checks found and fixed heading-order gaps.
- [x] SC-B03 — Interest navigation, disclosure and removal of obsolete preview wording.
  - Report (2026-10-01): Four budget slots now beauty/fashion/personalised/creative interests. Commercial disclosures, delivery context and localized shopping copy updated; policies/read-article navigation stays internal. Build/link checks pass.
#### Phase completion report
- Status: Complete.
- Completed: SC-B01–SC-B03.
- Evidence/tests: Final 58/58 browser tests passed, including all locales, native affiliate navigation, page headings and axe; 92 HTML pages/9,139 local references validated.
- Visual review: Fresh home/directory/profile/Gifts/hub/campaign screenshots at 375/768/1024/1440; actual catalog pictures retain contain and notices precede shopping CTAs.
- Known issues: Unknown delivery remains an explicit notice; not a disabled approved link.
- Decisions/deviations: Existing layout, imagery, themes and public routes retained; concept data remains solely for independent Offer/disabled-component fixtures.
- Next phase readiness: Shopping paths verified for local handoff.

### Phase C
- [x] SC-C01 — Brand Finder filters, real results and native no-JS fallback.
  - Report (2026-10-01): Four criteria/eight interests, real images/links, independent country notes/order, no budget/price. Native SSR renders ten links. Moved no-JS notice outside React island; explicit no-JS visibility/navigation/storage tests pass on mobile/desktop.
- [x] SC-C02 — Legacy URL migration, UTM/hash and browser history.
  - Report (2026-10-01): Added src/lib/brand-finder.ts, category aliases and budget removal notice; replaceState on initial normalization, pushState for user choices, popstate restoration. Unit/browser tests preserve UTM, hash and exact filters; empty intersections are never silently relaxed.
- [x] SC-C03 — Empty/paused/storage/error states and single-click tracking.
  - Report (2026-10-01): Explicit per-filter removal/other-event paths, validated links only, no storage dependence. Native affiliate URL remains unchanged. Finder external click emits once; internal introduction emits none. Existing Offer expiry and seasonal/storage/asset regressions retained.
#### Phase completion report
- Status: Complete.
- Completed: SC-C01–SC-C03.
- Evidence/tests: Final browser batch verifies URL migration/UTM/hash/history, no-JS ten native links, blocked storage, exact event filtering, explicit empty-state recovery and single external/zero internal click events. 39 unit tests passed; the native controller additionally passes eight focused browser cases with no client React island.
- Visual review: Real-photo Finder screenshots at all four widths; image completion/contain and no-overflow asserted before screenshot.
- Known issues: Interactive filters require JavaScript; full native list and visible explanation remain without it.
- Decisions/deviations: Initial compact/idle-island experiments failed the final LCP gate. A native controller over server-rendered cards replaces client React hydration without changing UI/history/fallback; product Offer engine and expiry remain independent.
- Next phase readiness: Functional Finder ready; native controller measured 98/98/98 Performance, 100 accessibility and 2,255.792ms median LCP. Remaining final site-wide gates recorded in Phase E.

### Phase D
- [x] SC-D01 — Three sourced guides, related brands and featured examples.
  - Report (2026-10-01): English bodies 601/649/662 words; sources, update/read time, disclosed related brands and two explicitly EU-catalog Toybox examples. Official OPSS/GOV.UK/Your Europe consulted; no universal legal/age claim. Nine-entry content tests pass.
- [x] SC-D02 — Complete EN/DE/FR articles, metadata, UI/FAQ/policies; human review remains pending.
  - Report (2026-10-01): Locale-specific Markdown IDs with unchanged public slugs; no English-master fallback. Localized guide/home/FAQ/policy/footer/menu/consent labels and metadata. All copy remains review-pending. Visual review caught dark guide backdrop; fixed light reading surface and added explicit background assertion.
#### Phase completion report
- Status: Complete for local authored content.
- Completed: SC-D01–SC-D02.
- Evidence/tests: Nine locale records with nonempty sources, related brands, review status and calculated reading times; final all-locale article/metadata/axe/browser checks passed.
- Visual review: Four-width guide screenshots with fully loaded Toybox catalog examples. Light reading surface corrected after visual review and explicitly regression-tested; no English body fallback under DE/FR headings.
- Known issues: Native-language/legal review remains pending; not claimed or required to hand off this local edition.
- Decisions/deviations: Public slugs unchanged, locale-specific Markdown IDs; UK/EU rules and digital/physical fulfilment are distinguished.
- Next phase readiness: Local guide content ready; final performance evidence in Phase E.

### Phase E
- [x] SC-E01 — Build/unit/image/browser/axe/link/noindex/CSP/seasonal tests.
  - Report (2026-10-01): Final build 90 pages; strict check 102 files with zero errors/warnings/hints; 39/39 unit, 2/2 image and 58/58 mobile/desktop E2E tests. Link checker validates 92 HTML/9,151 local references, no missing assets/anchors/duplicate IDs/indexable preview. Includes all locales, exact referral/tracking, no-JS, storage/assets, axe, CSP, no third-party imagery/tracker and Halloween/Christmas/Black Friday regression. Native Finder required updating the touch-target test to inspect visible controls rather than deliberately hidden empty-state buttons.
- [x] SC-E02 — Four viewport reviews/baselines and three-run mobile audits of five page types.
  - Report (2026-10-01): Fresh loaded-image baselines at 375/768/1024/1440. All five three-run mobile batches pass: Performance 94–99, accessibility 100, median LCP home Effects-on 2407.055ms, directory 2406.907ms, Finder 2255.792ms, guide 2027.841ms, profile 2178.621ms; every final CLS <=0.000035111. Home third LCP 2885.590ms retained; median is the acceptance measure. Failing Finder island batches retained; replaced client React hydration with native filters to fix the repeatable gate. Detailed raw values/limitations in docs/qa/sitewide-brand-report.md.
- [x] SC-E03 — Updated operator docs/current status/rollback and local handoff.
  - Report (2026-10-01): Added docs/sitewide-brand-operations.md and docs/qa/sitewide-brand-report.md; refreshed README/runbook/current status while preserving all historical reports. Documents permission vs delivery, recipient/event order, native Finder/legacy URLs, pause/rebuild/non-destructive rollback and public-release boundaries. Local preview remains http://127.0.0.1:5180/en-gb/; no commit/push/deploy or index enabling.
#### Phase completion report
- Status: Complete for local handoff.
- Completed: SC-E01–SC-E03.
- Evidence/tests: Final 90-page build; strict 102-file check clean; 39 unit, 2 image and 58 browser cases pass; 92 HTML/9,151 references checked; all 15 final Lighthouse runs meet score/CLS gates and all five median LCP gates pass. Full values in docs/qa/sitewide-brand-report.md.
- Visual review: Four viewport screenshots/baselines, real images loaded/contain; light article surface fixed and asserted; native controls remain visually equivalent with visible 48px targets.
- Known issues: Unknown delivery and known restrictions remain notices. Local lab variability includes one home LCP 2.886s; median 2.407s passes the specified gate. Native/legal review and field/commission evidence are not claimed. Pixel-diff CI is not claimed by screenshot baselines.
- Decisions/deviations: Finder React hydration replaced by a lightweight native controller after repeat final-island median 2.704s failed; UI/filter/history/no-JS functionality preserved. Home Effects explicitly on in all three final audits. Noindex remains despite SEO 66. No public launch.
- Next phase readiness: Local affiliate-discovery edition ready. Public identity, hosting, human review, analytics dashboard and attribution/orders are a separate authorised phase.

Last verified: **2026-10-01**. **Site-wide brand affiliate local preview ready; public launch not ready.** Latest evidence: `docs/qa/sitewide-brand-report.md`; operations: `docs/sitewide-brand-operations.md`. Historical Halloween evidence: `docs/qa/halloween-report.md`; historical foundation: `docs/qa/report.md`; operations: `docs/runbook.md`. A checked task means its stated implementation is verified, not that all external phase gates are closed.

## Phase 0 — Brand and visual foundation

- [ ] P0-T01 — Finalise official name, domain and logo direction
  - Report: Blocked on final business decision. The UI uses “Seasonal Edit” as an explicitly temporary wordmark.
- [x] P0-T02 — Establish Modern European Editorial Commerce direction
  - Report (2026-09-30): Implemented paper/ink/moss/champagne/oxblood tokens, Newsreader + Manrope, compact 12-column-compatible layouts and four semantic seasonal themes.
- [x] P0-T03 — Create original preview imagery
  - Report (2026-09-30): Four built-in imagegen editorial assets retained in `assets/originals/`; responsive AVIF/WebP in `public/images/`. Duplicate public PNGs removed after hash comparison; originals retained. Briefs in `docs/image-prompts.md`. These are concept images, not SKU photos or product-test evidence.
- [ ] P0-T04 — Build GB/DE/FR merchant matrix and select 20 real products
  - Report: Pending authorised merchant/feed data. Six non-commercial concept records are used only to validate layout and filtering.
- [x] P0-T05 — Document desktop/mobile layout reference
  - Report (2026-09-30): Built homepage, event and Finder topology in `docs/wireframes.md`; screenshots in `docs/qa/`. No approved external Figma moodboard is claimed. Real 60/40 product/lifestyle ratio awaits actual product assets.

#### Phase completion report
- Status: Partial — preview foundation complete; commercial inputs intentionally blocked.
- Completed: Style direction, themes, responsive visual assets.
- Evidence/tests: Source assets in `public/images`; token implementation in `src/styles`.
- Visual review: Product-first layout and compact section rhythm implemented.
- Known issues: Official identity, merchant list, real image rights, 20 products and at least ten valid offers per market still required.
- Decisions/deviations: No fake logos, prices, ratings, stock or partner links.
- Next phase readiness: Ready for code foundation.

## Phase 1 — Code foundation and design system

- [x] P1-T01 — Initialise Astro, strict TypeScript, Tailwind v4 and React islands
  - Report (2026-09-30): Static Astro with strictest TS, pinned dependencies/lockfile and Workers assets config. Native menu/market selector remove header React hydration. React remains for Finder and configured consent UI. Build has zero errors/warnings/hints.
- [x] P1-T02 — Create folder architecture and self-host fonts
  - Report (2026-09-30): UI/commerce/editorial/interactive layers created; Newsreader and Manrope bundled locally.
- [x] P1-T03 — Build tokens, seasonal themes and primitives
  - Report (2026-09-30): Container, Stack, Cluster, SectionLabel, EditorialHeading, Button, IconButton, Tag, Price, MediaFrame and Disclosure; four-theme noindex `/design-system/`. Self-hosted italic/normal fonts, 48px controls and reduced-motion rules verified.
- [x] P1-T04 — Set locale routing and preview security defaults
  - Report (2026-09-30): EN-GB/DE-DE/FR-FR and root market selector; no IP redirect. Canonical/hreflang only with configured origin. CI quality/daily refresh and optional preview deployment supplied in `.github/workflows/quality.yml`, now published at repository root in `XN0M/seasonal`; hosted CI result not verified yet.
- [ ] P1-T05 — Enforce visual regression baselines
  - Report (2026-09-30): Four-width screenshots generated and reviewed, persistent 375/1440 references saved. Automated pixel-diff/cross-platform goldens not implemented yet.
- [x] P1-T06 — Publish project to the user-provided GitHub repository
  - Report (2026-09-30): Pushed initial implementation commit `0fb734a` to `https://github.com/XN0M/seasonal.git`, branch main tracking origin/main. Source, tests, images and documentation included; dependencies, build output, private environment files and runtime reports excluded. No force push; original remote was empty. This documentation update is a separate follow-up commit.

#### Phase completion report
- Status: Core foundation verified; CI connection and enforced visual regression remain pending.
- Completed: Project shell, design system, locale skeleton, deployment config.
- Evidence/tests: `astro.config.mjs`, `tsconfig.json`, `src/styles`, `public/_headers`.
- Visual review: 375/768/1024/1440 screenshots; four-theme axe passes. This is not certification of every future token pairing.
- Known issues: GitHub target is now `XN0M/seasonal`; first hosted CI result is not yet verified. Cloudflare credentials and opt-in deployment remain unconfigured.
- Decisions/deviations: Preview remains static and privacy-first.
- Next phase readiness: Ready.

## Phase 2 — Data and content engine

- [x] P2-T01 — Define typed commerce and event contracts
  - Report (2026-09-30): Added Product, Offer, Brand, Merchant, Market, Locale and SeasonalEvent contracts without `any`.
- [x] P2-T02 — Implement event-phase and offer validation
  - Report (2026-09-30): Central phase dates, HTTPS/exact-host/tracking/market/currency/status/ID/expiry rules; future/stale price checks. Real budget results use current market offer price rather than the concept band. Expired clicks also blocked client-side.
- [x] P2-T03 — Configure validated content collections
  - Report (2026-09-30): Event, guide and policy collections validate localized fields and review status at build time.

#### Phase completion report
- Status: Implemented with preview records.
- Completed: Data boundaries, resolver and content validation.
- Evidence/tests: 18 unit tests cover commerce, dates, Finder, references, localised routes and truthful JSON-LD.
- Visual review: Not applicable.
- Known issues: Live data/feed integration is deliberately deferred.
- Decisions/deviations: Preview offers are ineligible by design.
- Next phase readiness: Ready.

## Phase 3 — Core interface

- [x] P3-T01 — Build header, mobile menu, Event Hero and phase rail
  - Report (2026-09-30): Compact header, native modal menu, route-aware market selector, two-CTA hero, event-prefilled Finder and current-phase ARIA. Menu Escape/focus restoration, event anchor and 48px controls tested.
- [x] P3-T02 — Build commerce cards and homepage sections
  - Report (2026-09-30): Product/concept grids, women/family, budgets, upcoming events, guide cards, criteria, FAQ and policy destinations. Responsive art with contain/cover; preview badge limited to concepts; commercial disclosure beside active CTA.
- [x] P3-T03 — Build shareable Gift Finder
  - Report (2026-09-30): All five criteria: recipient, interest, budget, event and market. Normalised URL/history/UTM state, ARIA-pressed, reset and no-match guidance. Preview concepts are explicitly separate from eligible results; unknown/stale prices cannot match budgets.
- [x] P3-T04 — Build event, guide and brand routes
  - Report (2026-09-30): 57 routes/pages including event, recipient, real draft guides, policies and compact paid variants. Event budget shortcuts preserve event. Brand directory shows pending partnerships; no brand detail is falsely advertised.
- [ ] P3-T05 — Finish richer commercial event hub and brand details
  - Report (2026-09-30): Full inline category/recipient filters, sourced comparisons and BrandCard/OfferCard/ShippingDeadline variants remain pending. Budget links currently delegate to Finder. Brand page gate of three real products not met.

#### Phase completion report
- Status: Core local preview verified; complete catalog-driven commerce UI still pending.
- Completed: Core pages and interactions.
- Evidence/tests: 18 desktop/mobile E2E checks, axe and built-link/asset scanner.
- Visual review: Four target widths without horizontal overflow; persistent 375/1440 references reviewed.
- Known issues: Real catalog, richer inline filters/comparisons and campaign inputs absent. Paid variants are preview-only, not ready for ads.
- Decisions/deviations: Product cards show “partner link coming soon” instead of false CTAs.
- Next phase readiness: Ready for content replacement.

## Phase 4 — Content and localization

- [x] P4-T01 — Add English preview copy and localized UI shell
  - Report (2026-09-30): Localised primary shell/concepts and Black Friday/Christmas headline copy; three substantive English master guides, FAQ and policies. Several secondary sections and DE/FR article bodies remain English; full localisation is not claimed.
- [ ] P4-T02 — Human-review German and French commerce/editorial copy
  - Report: Pending native-language editorial review; all preview pages remain noindex.
- [ ] P4-T03 — Verify real image rights, product accuracy and sources
  - Report: Pending brand/merchant assets. Original preview imagery is safe for layout only.
- [x] P4-T04 — Metadata and conditional structured-data scaffolding
  - Report (2026-09-30): Article, Breadcrumb, FAQ and conditional ItemList/Offer helpers. Preview/expired offers produce no Offer; stale prices omitted. Optional origin controls canonical/hreflang/absolute OG; no made-up hostname. Preview sitemaps intentionally empty.
- [ ] P4-T05 — Complete sourced recipient/category/comparison content and Halloween beta
  - Report (2026-09-30): Recipient shells and budget shortcuts exist, but richer sourced content/Halloween event are not finished. Four visual themes do not mean four complete catalogs.

#### Phase completion report
- Status: Partial.
- Completed: Localized prototype content.
- Evidence/tests: All locales are generated at build.
- Visual review: Localised shell passes axe; human language review still pending.
- Known issues: Human review and real catalog absent.
- Decisions/deviations: No claims or ratings added without evidence.
- Next phase readiness: Can accept production content without UI rewrite.

## Phase 5 — Affiliate, analytics and consent

- [x] P5-T01 — Implement affiliate event contract and safe CTA gate
  - Report (2026-09-30): Sponsored/nofollow exact URL and same-tab payload tested using intercepted merchant fixture. Preview records cannot navigate or emit affiliate clicks; tracking URL parameters are not rewritten.
- [x] P5-T02 — Add privacy-first consent surface
  - Report (2026-09-30): GA/Ads/Meta SDK scaffold loads only after stored permission if configured. Preference/reset controls tested; zero SDK requests in unconfigured preview. Native default preferences avoid React overhead. Legal/regional/provider consent verification is not complete.
- [ ] P5-T03 — Connect analytics and affiliate dashboards
  - Report (2026-09-30): Local browser event only by default; cookie-light remote sink and EPC/conversion dashboard not connected. Need analytics IDs/provider/network decisions. Network remains authoritative for order/commission/refund data.

#### Phase completion report
- Status: Safe scaffold complete; external integrations pending.
- Completed: Event payload, gating, disclosure and consent UI.
- Evidence/tests: Unit and E2E assertions.
- Visual review: Consent is compact on desktop and mobile.
- Known issues: No reporting backend by V1 definition.
- Decisions/deviations: Zero trackers run in the unconfigured preview.
- Next phase readiness: Ready when credentials are provided.

## Phase 6 — QA, security and deployment

- [x] P6-T01 — Add CSP and baseline security headers
  - Report (2026-09-30): Hash-aware Astro CSP plus Workers frame/base/object protections, HSTS, nosniff, referrer and permissions policies. Fixed data-font CSP violation without relaxing font-src. Actual deployed headers still unverified.
- [x] P6-T02 — Add unit, E2E and accessibility test suites
  - Report (2026-09-30): Responsive AVIF/WebP pipeline, Vitest/Playwright/axe and built-link/asset/noindex checks. Dependency audit reports zero vulnerabilities.
- [x] P6-T03 — Verify local production build and target viewports
  - Report (2026-09-30): 57 pages, zero build diagnostics, 18 unit + 18 browser tests, 3318 local references pass after footer contrast correction. Latest Lighthouse mobile Performance 96 / Accessibility 100 / Best Practices 100; LCP 2565ms, CLS 0, TBT 0ms. Earlier LCP 2483.58ms; threshold not a stable pass yet. SEO 66 solely from required preview indexing block. INP and production SEO not verified. Evidence: `docs/qa/report.md`.
  - Christmas follow-up (2026-09-30): Final local build zero diagnostics; 21 unit + 32 browser tests, 3775 references pass. Three final mobile runs: Performance 97, Accessibility/Best Practices 100, median LCP 2404.535ms, CLS 0. This resolves the local LCP gate for this preview build only. Evidence: `docs/qa/christmas-report.md`; public/RUM gates remain.
- [ ] P6-T05 — Deploy and verify Cloudflare preview
  - Report (2026-09-30): Static deployment dry-run succeeds (205 files at tested build). Real deployment blocked on missing Wrangler authentication. No live URL or response-header verification is claimed.
- [x] P6-T06 — Supply daily CI configuration and rollback runbook
  - Report (2026-09-30): Daily workflow and opt-in deploy configuration supplied; data/environment/deploy/rollback guide in `docs/runbook.md`. Schedule is not connected or live-rehearsed yet.
- [ ] P6-T04 — Remove preview launch blockers
  - Report (2026-09-30): Requires official identity/domain/operator, 20 sourced products, 10 eligible offers per market, real image permissions, DE/FR review, legal/consent and provider setup, live deployment/header/rollback QA, central publishing controls and approval to index. Do not remove noindex for a higher preview SEO score.

#### Phase completion report
- Status: Local preview verified; live deployment/public release incomplete.
- Completed: Build, QA, image pipeline, security scaffold, lab metrics, dry-run packaging and operating docs.
- Evidence/tests: `docs/qa/report.md`; 18 unit + 18 E2E tests; zero advisories at scan time. Latest lab result is one measurement, not a production guarantee.
- Visual review: Target widths reviewed; screenshots are references, not enforced pixel-diff tests.
- Known issues: Cloudflare authentication; public SEO/live headers/RUM/INP; catalog, translations and external services. Baseline LCP exceeded target by 65ms; Christmas follow-up now meets the local three-run target, but actual deployment/real assets still require remeasurement.
- Decisions/deviations: Required noindex kept. SEO ≥95 not claimed; TBT is not used as an INP substitute.
- Next phase readiness: Ready for preview review, not soft launch.

## Christmas experience upgrade — approved 2026-09-30

Scope: Christmas first; controlled festive hero; existing colours, typography, spacing, commerce data, locales and noindex retained. No public deployment or GitHub push in this upgrade.

### Phase A — Shapes and foundation motion
- [x] CX-A01 — Centralise radius/easing/duration; soften cards, panels and controls
  - Report (2026-09-30): Tokens added; product 16px, editorial/panel 24px, pill controls. Grid columns, spacing and product fit unchanged. Astro strict build: zero errors/warnings/hints; responsive/axe checks pass in initial browser run.
- [x] CX-A02 — Refine menu/Finder feedback and remove purchasable-looking preview hover
  - Report (2026-09-30): 200ms controls, 250ms menu/Finder feedback, 300ms available-card motion (2px max); no preview-card/image zoom. Menu keyboard/focus, URL filters, FAQ and touch tests pass in initial browser run.

#### Phase completion report
- Status: Complete; final regression evidence in Phase C.
- Completed: CX-A01 and CX-A02.
- Evidence/tests: Strict build, 21 unit and 32 browser tests; responsive/menu/Finder/axe checks pass.
- Visual review: Rounded product grid and all four target viewports reviewed; focus/touch remain usable.
- Known issues: Initial Christmas inline-style CSP issue was isolated to Phase B and repaired without weakening policy.
- Decisions/deviations: Preserve grid density and section spacing.
- Next phase readiness: Christmas scene can be developed against the new tokens.

### Phase B — Christmas scene
- [x] CX-B01 — Typed theme configuration, original SVG tree/branches/ribbon/snow/Santa
  - Report (2026-09-30): Christmas-only SeasonalScene and typed theme registry; original SVG artwork; 12 desktop/6 mobile snow particles; transform-only 3s Santa flight. No third-party scripts or image/logo generation. Desktop hero image shortened by the controls' reserved height to retain the original footprint.
- [x] CX-B02 — Localised effects/replay controls, safe storage, reduced-motion and lifecycle pauses
  - Report (2026-09-30): EN/DE/FR pressed-state toggle and replay; local preference and once-per-session Santa; safe storage fallback and static no-JS. Load/viewport/visibility gates and live reduced-motion changes tested. CSP inline-attribute failure repaired with stylesheet presets/trusted CSSOM, no policy relaxation. 32 Chromium tests pass. Privacy copy documents the two functional display settings.

#### Phase completion report
- Status: Complete for Christmas preview.
- Completed: CX-B01 and CX-B02.
- Evidence/tests: 32 desktop/mobile Chromium tests; no browser/CSP/asset errors; localized axe and lifecycle tests pass.
- Visual review: 375/768/1024/1440 on/off heroes, Santa mid-flight and reduced-motion reviewed; motifs stay within the image and controls remain outside it.
- Known issues: With storage blocked, preferences last only for the current document; no-JS intentionally has no animation controls. Real-device/WebKit verification remains pending.
- Decisions/deviations: No third-party animation scripts, no moving decorations over commerce/text.
- Next phase readiness: Interaction/responsive verification completed in Phase C; ready for user preview review.

### Phase C — QA and preview handoff
- [x] CX-C01 — Unit/E2E/axe, links/assets/noindex and viewport screenshots (effects on/off)
  - Report (2026-09-30): Final strict build: 57 HTML pages, zero diagnostics. 21 Vitest + 32 Chromium desktop/mobile tests pass. 3775 local references pass; all preview HTML remains noindex. Eight tracked first-fold on/off references plus Santa/static/card screenshots reviewed at 375/768/1024/1440. Full-page captures remain in ignored test-results; no pixel-diff certification or physical-device claim. Evidence: docs/qa/christmas-report.md.
- [x] CX-C02 — Three mobile Lighthouse runs and performance adjustments
  - Report (2026-09-30): First batch median LCP 2564.35ms; adjusted initial control-space reservation and mobile padding, and inlined small styles with Astro CSP hashes. Final batch 11:19 UTC: all three Performance 97 / Accessibility 100 / Best Practices 100 / SEO 66; LCP 2404.54/2403.56/2404.54ms, median 2404.535ms, CLS 0 in all runs, TBT 10/21/14ms. All upgrade lab thresholds pass. SEO remains intentionally limited by noindex; TBT is not field INP.

#### Phase completion report
- Status: Complete for local Christmas preview.
- Completed: CX-C01 and CX-C02.
- Evidence/tests: docs/qa/christmas-report.md; 21 unit + 32 browser tests; final three-run Lighthouse summary, build/link scanner and git diff whitespace check pass.
- Visual review: All four widths on/off, rounded cards, Santa and static reduced-motion scene reviewed. No extra sections; hero controls accommodated within the original default-motion footprint.
- Known issues: Physical-device/Firefox/WebKit, field INP and production performance remain unverified; production launch blockers are unchanged.
- Decisions/deviations: Preserve noindex and inactive commerce. Inline built styles instead of adding an animation library; no unsafe-inline CSP change. No deploy/commit/push. Conversion evaluation waits for real offers/traffic.
- Next phase readiness: Preview review only; other seasonal scenes and Thanksgiving remain out of scope.

## Seasonal backgrounds and Lottie decoration — approved 2026-09-30

Scope: Christmas + Black Friday, EN/DE/FR; six homepage placements, four event-hub placements; unchanged commerce/layout, noindex, local preview only. Supersedes the hero-only scene; historical Christmas reports above are preserved.

### Phase A — Assets and visual composition
- [x] DEC-A01 — Obtain and validate licensed vector Lottie assets; record provenance and size
  - Report (2026-09-30): Four licensed motifs by JAStudio, KaramAhn, Mahmud Hasan and Anwar Khan; source archives outside public output, source/author/license records in docs/assets/provenance.md and public/animations/credits.html. Six adapted JSON files; no external images/fonts/expressions, no Premium/account requirement or placeholder. Gzip totals Christmas 31,351B / Black Friday 7,266B; each JSON under 150KB and each event under 500KB. Safety/budget unit test passes.
- [x] DEC-A02 — Lock desktop/mobile safe placement and consistent colour adaptations
  - Report (2026-09-30): Shared flat-vector, fir/champagne/oxblood palette; four source authors adapted consistently. Six home / four event positions, static shell on editorial pages. Geometry check passes at 375/768/1024/1440 with no intersection over visible headings, paragraphs, links, buttons, selectors or product cards. Small ornaments shrink to existing padding bands rather than enlarging sections. Native header/footer motifs are original SVG, not downloaded placeholders.
- [x] DEC-A03 — Background tokens and static posters for both events
  - Report (2026-09-30): Christmas #FAF8F3 with ice-edge ambience; Black Friday #F3EEE4 with dark green/champagne ambience. Six local SVG posters rendered at 55%; docs/qa/decoration-assets.png reviewed. Mature-tree segment avoids blank-pot intro. No fake sale label, logo, money or claim added.
#### Phase completion report
- Status: Complete.
- Completed: DEC-A01–A03.
- Evidence/tests: 22 unit tests; asset board and four-width geometry/screenshots.
- Visual review: Coherent vector palette and two event backgrounds; safe positions reviewed.
- Known issues: No asset blocker; physical-device/production performance remains to be measured separately.
- Decisions/deviations: Multiple free authors adapted; original header/footer SVG avoids incompatible downloaded confetti/expressions. Small ornaments are reduced where the existing padding cannot fit 72–96px, preserving layout. SVG light player, no external runtime requests.
- Next phase readiness: Assets ready for integration.

### Phase B — Integration and control
- [x] DEC-B01 — Typed configuration, reusable decoration and shared playback controller
  - Report (2026-09-30): SeasonalDecorationConfig/themes, reusable SeasonalDecoration and light-player type declaration; one lazy controller with cloned/cached local JSON, load/visibility/proximity gates, 3/2 motion budgets, header one-shot and static/error posters. No React island added. Unit and viewport/tab/failed-asset browser tests pass.
- [x] DEC-B02 — Homepage/event/page-shell integration; replace old scene without duplicating effects
  - Report (2026-09-30): Six home, four event, two Finder points; guide/brand/policy shell static. SiteLayout, home/event pages and SeasonalScene integrated. Removed the old hero-only tree/branches; original snow/Santa now use the common controller. Existing grid/spacing/media-fit retained; Black Friday has no empty Santa control space. Safe-zone/overflow checks pass.
- [x] DEC-B03 — Effects preference, explicit reduced-motion override and Santa replay
  - Report (2026-09-30): EN/DE/FR Effects in desktop header/mobile menu, accessible state/description and localized device-override notice; auto/on/off preference with safe migration/storage fallback. Old off retained; old on not treated as override. Christmas off-state explains replay with Enable effects; three-second, once-per-session Santa and manual replay pass keyboard/reduced-motion/persistence tests. Non-decoration UI remains reduced-motion.
#### Phase completion report
- Status: Complete; final regression/audits tracked in Phase C.
- Completed: DEC-B01–B03.
- Evidence/tests: 22 unit tests; interaction/lifecycle/storage/axe regressions and target-width safe-zone checks pass. Source: src/lib/seasonal/, SeasonalDecoration, SeasonalScene, EffectsControl and seasonal.css.
- Visual review: Christmas and Black Friday hero/background plus full-page references reviewed; images decoded before captures.
- Known issues: Full screenshot-batch test initially exceeded its 60s high-DPR artifact timeout; CSS-pixel capture removed that overhead (final mobile batch 10.1s), with a bounded 120s artifact-batch limit. No remaining local functional blocker; production gates remain separate.
- Decisions/deviations: No new market, route, commercial claim or tracker; no CSP relaxation. Storage-blocked settings last only for the current document. Native header/footer SVG and Lottie motifs share palette/controller.
- Next phase readiness: Ready for final QA and three-run performance measurement.

### Phase C — Verification and preview handoff
- [x] DEC-C01 — Unit, browser, axe, asset/link and CSP verification
  - Report (2026-09-30): Final strict build checks 72 files with zero diagnostics; 57 Astro pages. 22 unit + 30 desktop/mobile E2E tests pass, zero skipped/flaky/unexpected. Scanner: 58 HTML pages including credits / 3,860 references, all noindex, no missing assets/anchors or duplicate IDs. Browser/CSP/console checks and exact affiliate fixture/expired/inactive commerce regressions pass; no external decoration request. Production npm audit: zero advisories. Source/asset budgets and whitespace checks pass. Evidence: docs/qa/decorations-report.md.
- [x] DEC-C02 — Two events × four widths × effects on/off screenshots and visual review
  - Report (2026-09-30): Sixteen first-fold on/off references, two decoded full-page captures, responsive and asset boards in docs/qa/ reviewed at 375/768/1024/1440. Safe-zone and overflow assertions pass; no grid/spacing change or product overlay. Additional DE/FR reduced-motion-on diagnostics at 375px pass axe/overflow and fit the original 54px controls, with localized screenshots. Images eagerly primed only in test pages; production lazy loading retained. Header focus outlines layered above decoration. CSS-pixel screenshots avoid high-DPR artifact timeout; no physical-device or pixel-diff certification claimed.
- [x] DEC-C03 — Three-run mobile Lighthouse for Christmas home and Black Friday hub
  - Report (2026-09-30): Device-default runs alone missed active-Lottie cost, so added explicit-on/cold-cache audit with verified JSON fetch. Initial on median Christmas 2936.757ms (one P88), BF 2714.216ms. Responsive tree WebP posters and paint/idle scheduling repaired budgets. Final three-run Christmas P95/97/97, A100/BP100, median LCP2479.646ms; BF P97/95/97, A100/BP100, median 2406.354ms. CLS0.0000351 in all final runs; every specified lab gate passes. Individual LCP runs can exceed 2.5s; acceptance uses median. SEO66 intentionally noindex; TBT not field INP. Evidence: docs/qa/decorations-report.md and labeled audit summaries.
#### Phase completion report
- Status: Complete for local preview.
- Completed: DEC-C01–C03.
- Evidence/tests: docs/qa/decorations-report.md; 22 unit / 30 E2E tests, strict build, 3,860 link/asset references, production audit and both three-run active-motion Lighthouse batches pass.
- Visual review: Two event backgrounds, four responsive widths on/off, full-page commerce, static posters, six/four/two placements and focus-safe header reviewed.
- Known issues: Physical-device/Firefox/WebKit, deployed headers, field INP and production performance unverified. Real identity/catalog/merchant offers/translations/services remain original launch blockers. Storage blocked: preferences/Santa memory are document-local.
- Decisions/deviations: Keep noindex; no deploy/commit/push. Multiple free authors palette-adapted; native header/footer motifs; small ornaments shrink to existing padding. Tree poster rasterised responsively, player deferred to idle. Snow stays in the hero safe zone; outer-edge ambience is static to preserve movement/performance budgets. No commerce or tracker change.
- Next phase readiness: Ready for local user review; not public launch or paid traffic.

## Halloween background and decoration — 2026-10-01

Scope: Halloween as the October preview event on EN/DE/FR; dark outer background/hero and light content surfaces. Preserve layout, commerce, existing Christmas/Black Friday routes, Effects preferences and noindex. Local preview only; no push/deploy. Every task gets evidence immediately on completion; retain all historical reports above.

### Phase A — Event foundation and composition
- [x] HW-A01 — Halloween event, localized copy/phase labels and explicit active-event ID
  - Report (2026-10-01): Added halloween-2026, three localized event routes/copy, local-time 31 October dates and non-commercial preparation phases; src/data/campaign.ts selects the preview by ID, not array order or browser time. Existing Christmas/Black Friday and commerce data preserved. Strict build: zero diagnostics; 23 unit tests pass, including three-market dates/phase boundaries; localized browser/axe content tests pass in the running QA batch.
- [x] HW-A02 — Licensed pumpkin/ghost assets, validation and provenance
  - Report (2026-10-01): Obtained public free Lottie archives by Midhun Mohan and Alex Bradt; reused Mahmud Hasan stars. Provenance/license/source archives recorded. Adapted palette, removed the ghost's grave/word art/heart and cropped to the friendly character. Replaced pumpkin's wide source choreography with a seamless 10s vertical float (<8px at 240px width), continuously visible cluster and frozen internal transforms. SVG light-player posters rendered successfully; validation rejects expressions/fonts/images/external resources. Final JSON gzip sizes: pumpkin 1899B, ghost 5971B, star 766B (8636B total); no Premium/placeholder or asset blocker. Reproducible scripts/prepare-halloween.mjs; asset board reviewed.
- [x] HW-A03 — Static posters, original Halloween hero and six-position responsive composition
  - Report (2026-10-01): Original square/landscape Halloween SVG hero and three local posters; six placements preserve existing wrappers, columns and padding. Reviewed 375/768/1024/1440 on/off and DE/FR opt-in references. Visual review caught scoped muted-text overriding dark-hero colour and square art cropping on mobile; fixed with hero-region tokens and a media-selected landscape SVG, without increasing frame height. Shortened localized headlines to avoid unnecessary wrapping. Axe plus computed-colour contrast against the brightest hero gradient stop pass; safe-zone/overflow tests pass.
#### Phase completion report
- Status: Complete for preview.
- Completed: HW-A01–A03.
- Evidence/tests: Strict build, 23 unit tests, 36 browser tests; provenance and responsive/asset references in docs/qa/.
- Visual review: Friendly pumpkin/ghost/star palette, dark hero and light commerce surfaces; no Christmas hero art or grave/lettering in ghost.
- Known issues: No asset blocker; real Halloween catalog and native-language editorial review remain outside this visual upgrade.
- Decisions/deviations: Two free source authors plus reused stars; original vector hero has separate mobile art direction. Tiny native header webs fit existing safe strip; no placeholder or fabricated offer.
- Next phase readiness: Asset/event contracts ready for integration.

### Phase B — Integration
- [x] HW-B01 — Extend existing motif/config/controller and scoped backgrounds
  - Report (2026-10-01): Enabled typed Halloween placements (web/pumpkin/ghost/star), reusing existing light player, proximity/visibility/idle lifecycle and 3/2 concurrent budget. Background/hero/content tokens are scoped in seasonal.css; only hero colour tokens become light, commerce ink stays unchanged. No new React island, dependency, tracker or CSP exception. Budget, lifecycle and error tests pass.
- [x] HW-B02 — Homepage/event/page-shell integration and event-prefilled navigation/Finder
  - Report (2026-10-01): Halloween homepage/current-event/metadata/alt/shortcuts on EN/DE/FR; six home, four hub, two Finder and static editorial shell placements. All homepage Finder/budget shortcuts carry halloween-2026. No matching Halloween products: hub and filtered Finder show localized honest empty states and links to Christmas/Black Friday; homepage concepts explicitly say they are not Halloween recommendations. Products/offers untouched. No Halloween paid variant generated without a catalog.
- [x] HW-B03 — Effects, fallback/empty states and no Santa/snow in Halloween
  - Report (2026-10-01): Retained auto/on/off migration and saved off; explicit reduced-motion opt-in works via mouse/keyboard/mobile menu without enabling UI transitions. Off stops decoration; storage/asset failure and no-JS retain posters/content. Halloween has no Santa/snow/replay/control spacer. Christmas once-per-session Santa/replay and Black Friday tests now target their explicit routes, not an assumed Christmas homepage; regressions pass.
#### Phase completion report
- Status: Complete; final performance/handoff in Phase C.
- Completed: HW-B01–B03.
- Evidence/tests: 36 Chromium desktop/mobile E2E tests, localized axe, computed gradient contrast, concurrency/lifecycle and affiliate fixture regressions pass.
- Visual review: Four-width safe zones; no protected heading/CTA/price/card intersections or overflow; static/error decorations do not alter shopping controls.
- Known issues: Storage blocked means preference lasts in the current document; physical devices/other engines remain unverified.
- Decisions/deviations: Shared player/controller, no React decoration island or CSP relaxation.
- Next phase readiness: Ready for final build/link checks and three-run active-effects Lighthouse batches.

### Phase C — QA and local preview handoff
- [x] HW-C01 — Build/unit/E2E/axe/assets/links/noindex/CSP and existing-event regressions
  - Report (2026-10-01): Strict build: 76 checked files, zero errors/warnings/hints, 60 Astro pages. 24 unit + 36 desktop/mobile Chromium tests pass; no skipped/flaky cases. Scanner: 62 HTML pages including credit pages / 4057 local references, no missing anchors/assets/duplicate IDs; preview noindex intact. Localized axe/computed gradient contrast, menu/Finder/history, exact same-tab affiliate fixture, failed-asset/storage/no-JS, pause/lifecycle/budget and Christmas/Black Friday regressions pass. No console/CSP or external-decoration request; whitespace check passes.
- [x] HW-C02 — 375/768/1024/1440 on/off screenshots and EN/DE/FR reduced-motion review
  - Report (2026-10-01): Sixteen home/hub on/off first-fold references, decoded home full page, three locale reduced-motion opt-in captures and asset board saved in docs/qa/. All four widths reviewed; no overflow or protected-content collision. Tablet 768px cropping caught at final visual review; original Halloween hero uses contain on night backdrop at 501–780px, retaining its existing 160px frame. Fixed scoped MediaFrame override and added computed-fit assertion; final 36/36 browser tests pass (54s). Smartphone/desktop and product image fit unchanged; no physical-device or pixel-diff certification claimed.
- [x] HW-C03 — Three active-effects mobile Lighthouse runs each for Halloween home/hub
  - Report (2026-10-01): Cold-cache explicit-on batches verify local Lottie JSON loading. Initial P71 outlier and intermediate home median LCP2643.6892ms / hub P89/78 outliers retained, not accepted. Simplified pumpkin choreography, instantiate only visible/selected players, native Halloween FPS, low-priority non-hero images; hub secondary event-info ghost made static without removing its placement. Final home P97/97/97, A100/BP100, median LCP2425.5041ms. Hub incomplete batch P97/98 ended in tool ConnectionClosedError; complete retry P90/97/98, A100/BP100, median LCP2330.3542ms. CLS<=0.0000351108 throughout final batches. All specified local gates pass; SEO66 intentionally noindex, TBT is not INP. Raw summaries and full measurements/failed attempts documented in docs/qa/halloween-report.md.
- [x] HW-C04 — QA report, explicit event switch/rollback instructions and preview handoff
  - Report (2026-10-01): docs/qa/halloween-report.md contains source/asset evidence, screenshots, every rejected/incomplete/accepted audit batch, final metrics and known limits. README and docs/runbook.md document activeEventId, manual Black Friday switch after 31 October, rollback to holiday-2026, rebuild/verification and preservation of old routes/assets. Preview served on 127.0.0.1:5180; mobile Effects is in the menu. Final strict build and 4057-reference scanner pass; no push, commit or deployment, noindex unchanged. Existing commercial/translation/production launch blockers remain.
#### Phase completion report
- Status: Complete for local Halloween preview; public launch not approved.
- Completed: HW-C01–C04.
- Evidence/tests: docs/qa/halloween-report.md; 24 unit / 36 browser tests, strict build zero diagnostics, 4057 local references, final three-run home/hub lab gates and whitespace check pass.
- Visual review: Home/hub at four widths on/off, whole-page commerce, three locale opt-in states and asset board reviewed. No increased section height or grid/spacing change; hero art fits smartphone/tablet/desktop.
- Known issues: No live Halloween catalog, public identity, human translation review or production certification added. Lab CPU/score variation recorded; physical-device/Firefox/WebKit, real-user INP and deployed headers/performance remain unverified. Storage-blocked settings are document-local.
- Decisions/deviations: Hub secondary event-info ghost static per approved performance fallback; all four points remain. Halloween timings simplified/native FPS; non-hero images low priority. After October, switch configured event to Black Friday and rebuild manually; no scheduler/runtime clock switch. No push/deploy; keep noindex.
- Next phase readiness: Ready for user local preview review, not public launch or paid traffic.

## Halloween visual refinement — 2026-10-01

User review found the first illustration unfinished: merged pumpkin silhouettes, duplicate moons, disconnected gift and tablet negative space. This follow-up preserves the earlier implementation/test history, layout, commerce and preview noindex.

- [x] HVR-01 — Restore pumpkin detail and build a unified, original Halloween still-life
  - Report (2026-10-01): Fixed palette adaptation which had erased ribs/face/leaf contrast. Licensed pumpkin body retained; source teeth/diamond eyes replaced with original round eyes and a curved smile; cropped composition keeps stems visible, ten-second float reduced to 45 source units. Added reproducible scripts/prepare-halloween-hero.mjs: shared detailed kraft gift, layered ribbon/tag, plum parcel, shaded gourd, autumn foliage, ground/shadows and one crescent. SVGs 7829/7893/7987B raw; no image/font/filter/script dependency. Updated licensed notices and asset board; 25 unit tests pass, including tonal contrast and hero safety/budget assertions.
- [x] HVR-02 — Art-direct phone/tablet/desktop without changing frame height or interaction
  - Report (2026-10-01): MediaFrame now accepts an optional tablet art source; shared picture component uses phone <=500px, tablet 501–780px, desktop >780px, all cover without distortion. Removed tiny-centre contain workaround and duplicate hero moon. Pumpkin sits near the stage, with mobile/tablet maximum width 210px; phone still gourd moved clear of the seal. Preserved frame/section height, grid, six/four/two placements, controller/concurrency/Effects and unchanged commerce. Both full 36-test browser regressions passed; final four-width containment and screenshots reviewed.
- [x] HVR-03 — Responsive visual review, regression tests and performance verification
  - Report (2026-10-01): Strict build 77 files/zero diagnostics/60 Astro pages; 25 unit and final 36 desktop/mobile Chromium E2E tests pass. EN/DE/FR axe, four-width on/off screenshots, hero containment/safe zones, reduced-motion, lifecycle, fallback, Finder/affiliate and Christmas/Black Friday regression pass; scanner 4063 local references pass. Fresh explicit-on/cold-cache Lighthouse: initial home P89/97/97 (one gate miss retained); hub P97/96/95 median LCP2405.2972ms; same-build home repeat P97/97/97 median LCP2407.0668ms. A100/BP100 all nine, CLS0.0000351108. Final complete batches pass, but no claim that every observed run meets P90. Evidence and all attempts in docs/qa/halloween-refinement-report.md; user visual approval remains pending. No push/deployment, preview noindex retained.

#### Visual refinement completion report
- Status: Implementation/QA complete for local preview; awaiting subjective user approval, not production launch.
- Completed: HVR-01–03.
- Evidence/tests: docs/qa/halloween-refinement-report.md; build zero diagnostics, 25 unit/36 browser tests, 4063 local links, refreshed screenshot evidence and all nine fresh lab readings.
- Visual review: Round-eyed pumpkins with restored ribs/leaves, detailed shared gift still-life, one crescent; tablet no longer has tiny central art or clipped stem; phone gourd clear of seal. Same frame heights/spacing/grid and shopping safe zones.
- Known issues: Initial home P89 lab reading retained; repeated home and complete hub batches meet target without a claim of universal performance. Physical-device/other-engine/RUM and existing catalog/translation/production blockers remain.
- Decisions/deviations: Refine original vector art and licensed vector colours/face rather than add disconnected moving motifs or a new animation system. No UI motion/control/data/market/tracker changes.
- Next phase readiness: User can review updated local preview; no public push/deployment approved.

## Brand affiliate integration — 2026-10-01

Accepted scope: ten approved affiliate programmes, unchanged original URLs; two brand-card destinations; EN/DE/FR profiles; event-based ordering; user-supplied imagery only. Local preview stays noindex. No push/deploy. Missing photos do not block text-only profiles; unverified markets do not receive shopping CTAs.

### Phase A — Brand and content foundation
- [x] BR-A01 — Import ten brands and exact affiliate URLs; check identity, tracking and host allowlists.
  - Report (2026-10-01): src/data/brands.ts contains ten original referral URLs, independent merchant allowlists and network/tracking IDs. No canonical-domain substitution or extra query parameters. Registry and exact-parameter tests pass.
- [x] BR-A02 — Check catalog, market/service availability and source evidence; record unresolved markets.
  - Report (2026-10-01): Official merchant pages reviewed and evidence retained in docs/brands.md. Enabled GB for World of Cosmetics/Blue Oasis/Toybox, FR for Cocon de Lune and DE for SchenkDeinLied. Other five brands remain browsable with no market shopping CTA. Failed policy fetches and destination uncertainties recorded, not interpreted as merchant failure; no purchase or referral-click verification performed.
- [x] BR-A03 — Write EN/DE/FR profiles and explicit Halloween/Black Friday/Christmas editorial ordering.
  - Report (2026-10-01): Localized summaries, introductions, editorial notes, market messages and category labels authored. Explicit priorities in src/data/brands.ts; Halloween only World of Cosmetics, no irrelevant fill. Human language review remains a public-launch prerequisite. Unit tests verify switching events and filtering markets.
- [x] BR-A04 — Document requested user image metadata and handoff manifest.
  - Report (2026-10-01): docs/brands.md documents ten-brand image handoff, exact product names, source and permission, localized alt text and 3–6 image target. Empty assets/brand-images.json intake and output manifest created; no merchant imagery or placeholders added.
#### Phase completion report
- Status: Complete for reviewed preview data and preparation.
- Completed: BR-A01–A04.
- Evidence/tests: docs/brands.md, validated registry, 33 unit tests and strict Astro check with zero diagnostics.
- Visual review: Text/data preparation only; interface review in Phase D.
- Known issues: No user images supplied. Five merchant destinations unverified; no numeric delivery promises. Human translation review pending.
- Decisions/deviations: Approved programme membership is confirmed by user; shipping markets require separate merchant evidence.
- Next phase readiness: Ready for text-only interface; unverified destinations remain disabled.

### Phase B — Data and interface
- [x] BR-B01 — Add validated brand profile, affiliate-link and featured-product contracts.
  - Report (2026-10-01): Separate BrandProfile/BrandAffiliateLink/FeaturedProduct contracts and registry validation added; referenced IDs, HTTPS, allowlisted hosts, exact referral IDs and market evidence checked. Evergreen links need no artificial expiry; existing product offers retain expiry validation. Invalid schema, link tampering, paused/expired and market fixtures pass in 33 unit tests.
- [x] BR-B02 — Build two-link cards, category-filtered directory and localized brand routes.
  - Report (2026-10-01): BrandCard has separate native Visit/Explore destinations; directory has 3/2/1 columns and progressive category filters with query/history preservation. Thirty localized introduction routes generated with editorial copy, market notices and eligible related brands. No supplied imagery: galleries are absent, not placeholders. Browser tests confirm exact same-tab URL, one external click event, zero internal click events and no-JS navigation.
- [x] BR-B03 — Integrate up to three event-relevant brands into existing home/event picks sections.
  - Report (2026-10-01): Existing first homepage picks block replaced with brand picks; event hubs resolve their own event priorities, while directory uses activeEventId. Halloween GB shows one eligible brand, DE/FR honest empty states; BF GB shows three eligible brands. Concept products remain labelled preview and excluded from brand-gallery/Finder data. Six/four/two seasonal placements and existing filter/navigation regressions pass.
- [x] BR-B04 — Update disclosure, distinguish brand/product tracking and complete unavailable/no-image states.
  - Report (2026-10-01): Brand payloads use targetType and optional featuredProductId/placement; legacy product click/expiry supported without new trackers or PII. Strip/footer/policy/FAQ disclosure now distinguishes live brand links and inactive concepts. Unsupported-market Visit controls explain why disabled; no-image cards are typography-only. Full 46 Chromium desktop/mobile tests pass, including consent, storage/no-JS and seasonal regressions.
#### Phase completion report
- Status: Complete for text-only local preview.
- Completed: BR-B01–B04.
- Evidence/tests: 33 unit / 46 Chromium tests; 90 Astro pages; strict build checks 92 files with zero diagnostics; 5,434 local references pass.
- Visual review: Twelve brand directory/profile references at four widths; clear separate destinations, touch targets >=48px and no overflow. Localized axe passes.
- Known issues: Actual photos and five unresolved merchant market checks remain pending; no public launch/translation certification.
- Decisions/deviations: Existing product offers and Finder retain their independent validation. No concept image is reused as a merchant product.
- Next phase readiness: Text-only QA/handoff ready; image phase waits for owner files.

### Phase C — User imagery and featured selections
- [x] BR-C01 — Receive and verify user images, product identity/source and usage permission.
  - Report: Pending / awaiting user assets.
  - Follow-up report (2026-10-01): Owner changed intake to official merchant sources and confirmed affiliate image use in this chat. Twenty genuine catalog photos/illustrations now cover all ten brands; source/date/permission basis/original hashes recorded. This completes owner-confirmed local intake, not independent merchant/artist licence review or a public-launch permission certification; see BI-A01/B01 and docs/qa/official-brand-images-report.md.
- [x] BR-C02 — Extend responsive image pipeline and integrate manifest-backed thumbnails/gallery.
  - Report (2026-10-01): Added local intake, permission/source validation, preserved originals and no-upscale 320/640/960/1400 AVIF/WebP outputs with actual dimensions. BrandMediaFrame/Card/FeaturedProductCard consume the validated manifest; image/title/CTA all point to brand homepage with featured ID and placement. Two pipeline tests cover JPG/PNG/WebP/AVIF, dimensions, byte-preserved originals and invalid inputs; Windows file-handle cleanup repaired. Included image tests in test:all and CI. No real assets generated: BR-C01/C03 remain pending.
- [x] BR-C03 — Check actual product labels, alt text, proportions and brand-home affiliate destinations.
  - Report: Pending / awaiting user assets.
  - Follow-up report (2026-10-01): Twenty-image source board and photo-backed home/profile captures reviewed; image labels preserved with contain/no upscaling and localized alt. Browser clicks on actual image/title/button retain the exact brand-home referral and each emit one correctly identified event. Toybox EU examples and SchenkDeinLied service illustration explicitly identified. No price/stock/rating invented.
#### Phase completion report
- Status: Partial — awaiting user assets, not completed.
- Completed: BR-C02 only.
- Evidence/tests: Two image-pipeline tests and registry/resolver tests for 0/1/3/6 entries pass; no real product imagery inspected.
- Visual review: Text-only absence of gallery verified. Real photo identity, labels, crop/alt and gallery visual review pending.
- Known issues: No photos supplied; no placeholders count as completed product imagery.
- Decisions/deviations: Ship usable text-only profiles while gallery remains pending.
- Next phase readiness: Independent interface QA can proceed.

#### Phase C follow-up completion report — official-source intake
- Status: Local image intake complete under the owner's revised source instruction.
- Completed: BR-C01/C02/C03.
- Evidence/tests: Twenty original SHA256 checks, source ledger, two format/pipeline tests, real photo browser coverage; details in official-brand-images-report.md.
- Visual review: Source contact sheet and actual contain galleries/home slots reviewed; no fake logos or packaging crop.
- Known issues: Programme/creative agreements not independently inspected; market and translation launch gates remain.
- Decisions/deviations: Official merchant sources replace the initial user-upload-only constraint, based on explicit owner confirmation. Earlier partial reports above are historical.
- Next phase readiness: Photo-backed local review is ready; performance/public launch still gated.

### Phase D — QA and local handoff
- [x] BR-D01 — Build, meaningful unit/E2E/axe and link/noindex checks; affiliate and seasonal regressions.
  - Report (2026-10-01): Final full run 46/46 Chromium desktop/mobile tests, 33 unit and two image-pipeline tests pass. Strict build 92 files/zero diagnostics/90 Astro pages; scanner 92 HTML/5434 references, no missing assets/anchors/duplicate IDs/indexable previews. Exact native referral URLs, single external event/zero internal event, product expiry, no-JS, consent and seasonal regressions verified. Sandbox browser launch issue and two stale Black Friday expectations repaired/documented in docs/qa/brands-report.md; whitespace check passes.
- [x] BR-D02 — EN/DE/FR review at 375/768/1024/1440px; 0/1/3/6-image states.
  - Report (2026-10-01): Partial — text-only directory/profile reviewed at all four widths, twelve captures in docs/qa; localized axe/market tests and >=48px CTA targets pass with no overflow. Registry/resolver fixtures cover 0/1/3/6 entries; real 1/3/6-photo gallery/packaging/alt review awaits owner assets and is not marked complete.
  - Follow-up report (2026-10-01): Actual home and DE/FR/GB 1/2/3-image profiles exercised/captured at all four widths with positive dimensions/contain, no overflow or remote image requests; six-card layout fixture uses verified cards only inside tests and passes all four widths. Zero-image schema/pipeline and historical text-only rendering remain covered. Final 50/50 Chromium tests pass; not a claim of six unique products for a production brand.
- [ ] BR-D03 — Mobile performance checks for home, directory and brand profile; actual-image audit when supplied.
  - Report (2026-10-01): Partial — three-run cold-profile Lighthouse batches all pass local P>=90/A>=95/median LCP<=2500ms/CLS<=0.1. Home Effects-on P94/97/97, median LCP2408.406ms; directory P99/98/98, median2104.028ms; text-only profile P99/99/99, median2029.508ms. A100/BP100 all nine; maximum CLS0.043413251. Noindex retained; no photo-backed/field-INP certification. Actual-image audit remains pending user assets; detailed readings in docs/qa/brands-report.md.
  - Follow-up report (2026-10-01): Real-image home/directory/profile audits performed. Directory/profile median LCP2335.398/2104.429ms pass; homepage Effects-on median2558.990ms remains above2500ms, so this gate stays unchecked. Home P96/A100/CLS0.000035111 pass. Unused font subset declarations reduced; quiet-window, raster texture and sync-decode experiments did not resolve LCP and were reverted. Full readings/failed trials retained in official-brand-images-report.md; do not reuse historical text-only results as photo certification.
- [x] BR-D04 — Preview handoff and runbook for brands, images, event priority and pausing links.
  - Report (2026-10-01): docs/brands.md and README document exact-link data, market evidence, activeEventId/event priority, pausing/rollback, permitted local image intake and checks. docs/qa/brands-report.md contains test evidence, responsive captures, all nine lab results and explicit photo/market/translation limitations. Local preview served at 127.0.0.1:5180; no commit, push, deploy or public indexing performed.
#### Phase completion report
- Status: Text-only local handoff verified; full photo-backed acceptance pending.
- Completed: BR-D01/D04; text-only portions of BR-D02/D03.
- Evidence/tests: docs/qa/brands-report.md; 33 unit / 2 pipeline / 46 browser tests, zero-diagnostic build, 5434-reference scanner and nine mobile lab runs pass.
- Visual review: Four-width text-only directory/UK/FR profile references reviewed; localized navigation, market eligibility and seasonal regressions pass. Actual product imagery review not performed.
- Known issues: BR-C01/C03 and photo-backed D02/D03 await user assets; five market checks and human translation review unresolved. Physical-device/other-engine/deployed-header/RUM verification not claimed.
- Decisions/deviations: Preview noindex remains; no public push/deploy. Supported products stay outside Finder until real offers/prices exist.
- Next phase readiness: Ready for user text-only preview and authorised image intake; not public launch.

## Official brand imagery and homepage category slots — 2026-10-01

Owner requests official merchant images instead of waiting for uploads and confirms affiliate image-use permission through GoAffPro/Refersion. This is owner-provided permission evidence, not an independently reviewed merchant licence. Preserve genuine product/packaging, record every source, keep local preview noindex and do not push/deploy. Image alterations do not substitute for rights. World of Cosmetics' public page now refers to TradeTracker; preserve the supplied URL but flag programme/creative agreement confirmation before public launch.

- [x] BI-A01 — Curate official product/image sources for all ten brands; map products and record permission evidence.
  - Report (2026-10-01): Reviewed official Shopify/WooCommerce public metadata and product pages for all ten brands. Selected 20 catalog images, exact product sources and localized names/descriptions/alt in assets/brand-images.json. Owner confirmed affiliate image use in this chat; not represented as independent licence review. World of Cosmetics now advertises TradeTracker; original referral URL retained and programme/creative proof remains a public-launch check. Toybox photos explicitly identify EU catalog examples; SchenkDeinLied has one genuine service illustration, not invented physical SKUs.
- [x] BI-B01 — Fetch self-hosted originals and responsive derivatives; inspect product identity/alt/contain.
  - Report (2026-10-01): Official host/store-path allowlisted operator-only fetcher obtained all 20 original files, preserving bytes without cropping/logo changes or overwriting existing originals. Source/date/permission basis/SHA256/dimensions stored in docs/assets/brand-image-provenance.json. Existing offline image pipeline generated dimensioned AVIF/WebP derivatives; source contact sheet visually inspected. 34 unit and two pipeline tests pass; build strict checks 96 files with zero diagnostics, 7692 local references pass. Real gallery/browser QA follows in BI-D01.
- [x] BI-C01 — Replace home women/family concept slots with two-destination brand cards; remove duplicate home brand listing, retain directory/profile routes.
  - Report (2026-10-01): Existing four women slots now resolve beauty/self-care/fashion brands; existing two family slots resolve home/creative brands, sorted by current event and market eligibility. Editorial BrandCard uses genuine contain lead images plus remaining static thumbnails and distinct Visit/Explore CTAs. Removed separate duplicate home-brand grid; preserved #picks/#disclosure/#women-products anchors and six seasonal placements. Directory and thirty profile routes remain. Original product offers/Finder data untouched; no price/rating/sale invented. Build/data gates pass; responsive browser inspection underway.
- [ ] BI-D01 — Build, data/image/link/browser/axe and seasonal regressions; four-width imagery review and mobile performance.
  - Report (2026-10-01): Functional/visual QA complete: 34 unit, two pipeline and final50/50 Chromium desktop/mobile tests; strict check96 files/zero diagnostics/90 Astro routes, scanner92 HTML/7152 references. Actual 1/2/3-gallery and six-card layout fixture pass four widths; exact image/title/button referral clicks, no-JS, localized axe, animation/Finder/consent regressions pass. Photo-backed lab P/A/CLS meet targets but homepage median LCP2558.990ms misses2500ms, so full performance acceptance remains pending. See docs/qa/official-brand-images-report.md, including all failed/reverted trials.
- [x] BI-D02 — Update source ledger, image onboarding/runbook and completion reports; hand off local preview.
  - Report (2026-10-01): docs/brands.md/README now document official-source intake, owner confirmation vs independently reviewed rights, source/hash ledger, offline self-hosting and home category mapping. New official-image QA report records actual photos/browser results and the unresolved home LCP gate; historical text-only reports retained. Local preview available at127.0.0.1:5180/en-gb/#women-products. No commit/push/deploy or index change.

#### Phase completion report
- Status: Official imagery and functional local handoff delivered; full performance gate remains partial, not completed.
- Completed: BI-A01/B01/C01/D02; functional/visual portions of BI-D01.
- Evidence/tests: Public catalog snapshot, original-source/hash ledger, 34 unit / two pipeline /50 browser tests;96-file strict check/zero diagnostics/90 Astro routes and7152-reference scan. Three-run image-backed lab readings and reverted trials in official-brand-images-report.md.
- Visual review: Twenty-photo board and photo-backed home/EN-DE-FR gallery/directory screenshots;375/768/1024/1440 layouts pass; no packaging crop/stretch or remote image fetch.
- Known issues: Home Effects-on median LCP about2.56s versus2.50s target. Public-launch permission/programme paperwork, five market checks/regional Toybox kit and human translations remain unverified.
- Decisions/deviations: Owner changed the prior user-upload-only constraint and confirmed affiliate image use. Do not edit images to evade copyright or substitute source product URLs for affiliate links.
- Next phase readiness: Ready for owner local photo preview; further LCP optimisation and existing public-launch gates remain. No public deployment approved.

## Phase 7 — Soft launch and optimisation

- [ ] P7-T01 — Soft launch EN-GB, then reviewed DE/FR
  - Report: Not started; Phase 6 launch gates remain.
- [ ] P7-T02 — Evaluate qualified clicks and scale by EPC/conversion
  - Report: Not started; requires live affiliate traffic.

#### Phase completion report
- Status: Not started.
- Completed: None.
- Evidence/tests: None.
- Visual review: None.
- Known issues: Dependent on production inputs and launch approval.
- Decisions/deviations: None.
- Next phase readiness: Not ready.
