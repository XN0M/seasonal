# Private admin and redirect operations

## Current online state — 2026-10-02

The owner authenticated Wrangler to Cloudflare account 6b39dca62bcc2df3fe94f22aa7f8ea31. Existing Worker `seasonal` is deployed on evenal.click at version d952c013-2e9c-423a-b8e9-87491a97cbad. Existing D1 is **`sesonal-admin`** (provider spelling), ID 9e596acb-c807-4b53-9166-210c1a0932b4. All three migrations and the idempotent ten-brand seed were applied; the owner privately prepared a new password and only its salted hash was imported. Random `CSRF_SECRET` is stored as a Worker secret. Public checks: homepage 200/noindex, private login 200/noindex, unauthenticated admin 303 to login, auth status configured=true/setupAvailable=false, system redirect 302 to the original affiliate URL/no-store. The owner confirmed interactive login succeeded; private publish/CI setup is separate.

The first remote credential import failed because the generated SQL used explicit `BEGIN TRANSACTION`/`COMMIT`; D1 rejected it and did not write. The helper was corrected to let D1 import transaction handling do its work. The same prepared salted hash was imported successfully; read-only D1 query confirmed the configured email/version 1. Never publish or share `.wrangler/tools/owner-password.sql`.

The source/config fixes are presently local and have **not been committed or pushed**. Cloudflare's connected Git build can overwrite this direct deploy with the older all-zero database binding if another push triggers it. Reconcile and push the reviewed config before relying on connected builds; do not store the secret or credential SQL in Git.

## Confirmed Cloudflare deployment binding — 2026-10-02

The default `wrangler.jsonc` now targets existing Worker `seasonal` and D1 `sesonal-admin` (`9e596acb-c807-4b53-9166-210c1a0932b4`), confirmed by live Wrangler metadata in the resource-owning account. The provider database name is spelled `sesonal-admin`, though the earlier screenshot was read as `seasonal-admin`. This replaces the all-zero local placeholder that caused deployment error 10181. `npm run preview:worker`, `dev:worker`, `db:local` and local password reset explicitly use `--env local`, retaining the original local database and owner account. Direct local Wrangler commands must also specify `--env local --local`; provider defaults are not the local environment. `.dev.vars` remains private and is not uploaded by deployment.

The remote screenshot shows **zero tables**; correcting the binding does not initialize D1, create a remote owner credential or configure secrets. Online activation remains pending and requires separate authorization:

1. Authenticate Wrangler to the approved Cloudflare account in the operator's own terminal; back up any non-empty database first. Run `npm run db:remote:init` to apply all three migrations and the idempotent ten-brand seed to the confirmed remote database. This command is intentionally absent from build/deploy and does not import local account/session data.
2. Set a new random `CSRF_SECRET` (at least 32 characters) in Worker secrets. Do not paste it into chat or Git. Default non-secret variables select password mode, `https://evenal.click`, the owner email and disabled remote first setup.
3. Prepare a NEW password privately using `powershell -NoProfile -File scripts/set-admin-password.ps1 -PrepareOnly`. After approval, import the ignored salted-hash SQL into the confirmed remote D1 with `wrangler d1 execute sesonal-admin --remote --file .wrangler/tools/owner-password.sql`. Never import a backup of local sessions or reuse a password exposed in chat.
4. Deploy the reviewed code/artifact to `seasonal`, then verify HTTPS owner login, unauthenticated rejection, alternate-host blocking and an exact custom redirect. A Git push can trigger the owner's Cloudflare connected build, so obtain approval before pushing these changes.

Until migrations, seed, secrets and credential provisioning are complete, the online admin/redirect service is **not ready**. Cloudflare build retry alone cannot perform these steps. Local dry-run cannot prove the account owns the UUID, validate online authentication or international performance. Managed content publishing also requires its separate build-service/CI configuration below; the basic binding fix does not enable it.

## Custom affiliate links — A to B

Current link-management extension (2026-10-02): **Links → Dán link affiliate mới** is the default. Paste original URL A, enter a unique lowercase 4–64-character slug and select **Tạo link B**. Campaign label defaults to the slug, channel to `other`, expiry to none. No brand, locale, country or event is required. Use **Sao chép link B** on the created card. The card shows original A, full B and active/paused/archived status. Saving works immediately on the current Worker; do not publish for a custom redirect.

On local preview B starts with `http://127.0.0.1:5181/r/`; it is not a public ad link. After a separately approved, verified deployment to the existing Worker/domain, B uses `https://evenal.click/r/`. No online activation occurs in this change. Refresh the admin tab after code changes. Existing owner credentials and ten brand destinations remain unchanged.

Custom links accept encoded HTTPS URLs on port 443 to DNS-style public hostnames. Literal IP addresses, local/internal hostnames, credentials, spaces/control characters/backslashes and the website/Worker aliases are refused. Unicode URL components must already be percent-encoded (hostname punycode); the tool rejects rather than rewrites attribution. Validation is lexical, not a DNS/reachability or affiliate-program approval check. The Worker never fetches the destination per click. Original path, query ordering, tracking values and fragment are preserved in `Location`. Visitor query parameters cannot select or modify the stored target.

`REDIRECT_SELF_HOSTS` optionally lists additional own hostname aliases, comma-separated, to block along with their subdomains. The configured `ADMIN_ORIGIN`, `evenal.click` and `seasonal.xuannam4869.workers.dev` aliases are always blocked. Add aliases before changing hosting. This cannot inspect or guarantee the absence of redirects performed by a merchant after leaving Seasonal Edit.

Only the authenticated owner can create custom links; existing CSRF/Origin/session protection applies. The owner is responsible for permitted destination use and paid-channel terms. Creating a link is not ads approval. Custom links never become public catalog/landing entries and are excluded from content revisions. Existing **Chọn brand hiện có** campaigns retain their landing/publish flow and locked attribution.

Pause/resume affects the next request with no rebuild. Archived slugs and destinations are immutable: create a new B to change A. GET uses 302/no-store and an empty body; HEAD does not count, other methods return 405. Missing links return 404, inactive/expired 410, corrupt/unreadable target data 503. The dashboard shows requests and estimated clicks by campaign and custom hostname, not visitors/pageviews/orders; automation filtering is heuristic and statistics are best-effort. No intermediate UI or tracker is loaded.

Migration **0003_custom_redirects.sql** preserves existing rows and makes brand references optional only for custom targets. Apply `npm run db:local` after a private local backup; local backup at `.wrangler/tools/pre-custom-backup.sql` is Git-ignored and may include sensitive credential hashes. Never share or commit it. Export schema version 2 includes custom redirect fields; managed content stays schema version 1. Restore into an isolated database with all migrations, inserting explicit column names; never overwrite live data during QA. Remote migration/deployment requires separate approval.

Reproducible real-runtime QA uses a fresh isolated D1 directory `.wrangler/custom-link-runtime`, port 5394, fixture-only owner credentials and `ALLOW_ISOLATED_LINK_QA=true node scripts/custom-link-runtime.mjs`. Never point it at the owner/live database. Unit/API migration/export tests, browser four-width checks and the runtime report are documented in `docs/qa/custom-links-report.md`.

## Current human login: owner email/password — 2026-10-02

**Password-length update:** the owner explicitly removed the 15-character minimum. Current browser setup, server hashing and operator reset accept 1–128 characters; empty passwords are rejected. Historical 15-character references below are superseded. No existing credential is changed. Short passwords are weaker; this does not imply equivalent security or production readiness.

The owner chose native password login. Set `ADMIN_AUTH_MODE=password`, exact `OWNER_EMAIL`, exact `ADMIN_ORIGIN`, and a random `CSRF_SECRET` of at least 32 characters in the provider secret store. Local `.dev.vars` is ignored by Git. Never reuse the password exposed in chat. There is no public registration, password in source, default password or human Access requirement in this mode. Build-service Access still protects only `/_manage/_build/*`. Old human Access instructions below apply only to `ADMIN_AUTH_MODE=access`.

### Local first setup

Apply `npm run db:local` (including migrations 0002/0003), start `npm run preview:worker`, and open `http://127.0.0.1:5181/_manage/`. With `ADMIN_LOCAL_SETUP=true` on HTTP **127.0.0.1 only**, and no existing owner row, the login form allows the configured owner to set a NEW 1–128-character password twice. Sign in afterwards. There is no default password. The credential is a random-salted scrypt hash, not plaintext. Setup cannot overwrite an existing account and always refuses remote HTTP/HTTPS even if its local flag is enabled.

This bootstrap assumes the local operating-system account/machine is trusted; a local process/user controlling the machine is not a separate security boundary. Disable `ADMIN_LOCAL_SETUP` after setup. Do not expose the Wrangler port or Local Explorer to a network.

### Sessions, throttling and password reset

Sessions expire absolutely after one hour. Cookies are HttpOnly, SameSite=Strict and host-only; HTTPS uses a Secure `__Host-` cookie. Only keyed hashes of 256-bit random tokens are stored in D1. Writes/logout require exact Origin and per-session CSRF. Logout deletes the session; credential version changes invalidate previous sessions. Rotating `CSRF_SECRET` also invalidates existing sessions. No passwords/tokens are included in audit or admin exports. Authentication records require a separate secure database/provider backup; never import an old session table into live service.

D1 reserves attempts atomically before hashing: global account-wide five-attempt/15-minute window, including unknown submitted emails. Successful login removes only its own reservation. Deliberately exhausting attempts can temporarily deny the owner access. Before public activation add Cloudflare edge rate limiting and verify abuse/CPU limits on staging; never reduce hash strength to fit a hosting plan. Password-only authentication is not MFA or phishing-resistant. MFA/passkeys are a recommended separate upgrade.

For local reset run `npm run admin:password` in your own terminal. PowerShell masks the new password and sends it via stdin, not command-line arguments, to the hashing helper. Local import increments credential version, revokes sessions and resets the login limiter. No password is printed. `.wrangler/tools/owner-password.sql` contains a sensitive salted hash; keep it private, never commit/share it. No unauthenticated web reset or email recovery exists.

### Activation on evenal.click — not performed

Screenshots show existing Worker `seasonal` connected to `evenal.click`, but do not prove deployed admin code/D1/secrets. Inspect the approved existing Worker/database first; do not create competing routes or touch other domains. Apply migrations and idempotent seed to the explicitly approved remote database, bind it as `DB`, and deploy Worker-first code. Set `ADMIN_AUTH_MODE=password`, `ADMIN_ORIGIN=https://evenal.click`, exact owner email, `ADMIN_LOCAL_SETUP=false`, and a random `CSRF_SECRET` in the secret store.

Remote credential provisioning is operator-only, never through the website: `powershell -NoProfile -File scripts/set-admin-password.ps1 -PrepareOnly` prepares ignored SQL without applying it. Import into the approved remote database only after backup and separate approval. It must not run during recurring seed/deployment. No password belongs in chat. Human Access is unnecessary in password mode; reconcile any existing policy deliberately, retaining narrower build-service Access. Disable alternate workers.dev/preview hosts. HTTPS cookies, D1 consistency, actual CPU budget/plan, edge rate limiting, backup recovery and online login still need staging verification. No remote password, resources, push or deployment were configured here.

Historical Access-mode and commerce/publication instructions follow.

## Local scope and launch

The public site remains static. Worker routes redirect requests and protects all private UI/API before responding. Admin document/script/styles are **bundled into the Worker, not copied into public/dist**. Worker-first routing also checks encoded paths. No public navigation/sitemap entry exists. Knowing the URL is not authorization.

Run `npm run build`, `npm run db:local`, then `npm run preview:worker`. Public preview: `http://127.0.0.1:5181/en-gb/`. Astro-only preview cannot execute `/r/` routes and is no longer an end-to-end shopping preview.

Local admin at `/_manage/` deliberately returns 403 without genuine Access configuration. There is no deployed development bypass. `npm run test:admin-ui` starts a short-lived, loopback-only **isolated test harness** using ephemeral RSA keys and in-memory SQLite; it is not the owner login and is never bundled into the Worker. Screenshots document UI only, not production authentication.

Wrangler local Explorer is a development tool, not a production API. Keep local dev bound to loopback; do not expose its port to the internet.

## Online activation — separate approval required

Provide an approved custom hostname, Cloudflare account/zone, D1 database and exact owner email. Configure two Access applications with non-overlapping policy precedence:

1. Human application: `/_manage` and `/_manage/*` except the narrower build paths; Google IdP, exact email Include rule only, MFA enforced at Google/IdP, one-hour maximum session, no public enrollment or whole-email-domain allow rule.
2. Service application: `/_manage/_build/*`, Service Auth policy for a dedicated build identity only, separate audience and pinned JWT subject, one-hour token/session. It cannot call admin writes. Validate this path-policy precedence on staging; a broad human application must not consume service paths.

Disable workers.dev/preview URLs (config already does); ensure no unprotected alternate hostname or storage service exposes private documents. Worker checks exact configured origin and signed RS256 JWT, issuer, audience, expiration, issued time, session length and exact owner email. Email headers alone are ignored. Missing config closes access. MFA is an IdP/Access setting: local tests do not prove it was enabled.

Set non-secret provider variables using `.dev.vars.example` as a name inventory. `CSRF_SECRET` (random >=32 characters) and `GITHUB_TOKEN` go into Worker secret store only. Build service client ID/secret and scoped Cloudflare deploy token go into GitHub environment secrets. Never paste tokens into chat, source, browser or Git. A GitHub App installation token limited to Actions write on this repository is preferred; repository contents-write is not required for dispatch.

Use separate preview/production Worker names, Access audiences, D1 bindings and secrets. Render approved deployment config with `scripts/provider-config.mjs`; it refuses placeholder database ID or workers.dev origins. `CF_ZONE_NAME`, `CF_D1_DATABASE_ID`, `CF_D1_DATABASE_NAME`, owner/Access vars and `ADMIN_ORIGIN` must exist in the selected protected GitHub environment. Apply remote migration/seed only after explicit activation approval. No migration or resource creation happens automatically in this implementation.

Do not use the old `npm run deploy` on a managed live site: it can build source defaults rather than the selected revision. Legacy quality-workflow auto-deploy is disabled. Managed publication exclusively uses the exact-revision workflow, environment approval and already tested artifact.

## Brand and event editing

Copy, not merchant identity, is editable. EN/DE/FR summary/introduction/selection note and cover selected from existing brand-owned images are allowed. Market evidence, restrictions, original URLs/ref/rfsn/UTM, merchant allowlist and brand/event membership are immutable in V1. Human-review stays pending.

Events can select the active ID and reorder the existing relevant brands only. Save creates a new draft version, not a website change. Multiple tabs must submit the version they loaded; stale writes return 409 and the UI retains the unsaved form. Reconcile/reload before saving. The UI warns before discarding unsaved changes.

## Links and counting

System links `/r/brand-{brandId}` cover website CTAs; campaigns receive a new immutable slug and brand target. Slugs remain reserved after archive. System links can pause/resume, not archive. Campaigns can pause/resume/archive; archive is final. Pausing a campaign stops only that link; pausing a system link stops website CTAs, not other campaigns. No arbitrary URL or merchant editing exists.

`GET` returns 302 to the original URL only after DB status and source allowlist/tracking validation. Incoming query is never appended. HEAD is uncounted; other methods 405, unknown 404, inactive/expired 410, unavailable/corrupt destination data 503. No merchant fetch, interstitial HTML, pixel or JS redirect. Redirects always add one network hop.

Stats are GET requests and estimated clicks, never unique users/pageviews/orders/commission. Automation heuristics are incomplete and not fraud proof. Browser affiliate events describe click intent; they are **not ingested into server totals**. No IP, visitor email, fingerprint, full URL/query/referrer or identity cookie is stored in event rows. Raw records 30 days; daily aggregates 365 days; scheduled cleanup is 02:41 UTC. Local cron is not automatic; invoke Wrangler scheduled test endpoint or exercise retention unit tests. Hosting/Access may independently retain operational logs; provider privacy settings need review before online activation.

## Publish, landing and rollback

Publish requires valid complete content, immutable revision, matching draft version, server GitHub configuration and no other active job. GitHub dispatch acknowledgement is not publication. CI authenticates as build service, fetches exactly revision/job, builds/checks/images/browser/axe, deploys only into approved environment, then reports completion. Worker independently reads the bound ASSETS revision manifest before accepting `published`; stale callbacks cannot complete another job. Failure leaves current content until a verified deployment succeeds. A permanently interrupted build may leave an active job; inspect/cancel CI first, then reconcile the job in the provider database with an audited maintenance operation. Never clear a job while its build may still deploy.

Each active, non-expired campaign gets a real static landing in all locales, with editorial copy, actual images, independent delivery notes, disclosure and internal guide links. CTAs use the campaign wrapper. Admin copies the configured-locale landing URL only if its slug is in the **served** manifest. All five paid-traffic checks are informational; affiliate approval is not paid-channel/brand-bidding approval. Landing status is not platform approval. robots/noindex remain in force; AdsBot access and advertising eligibility require a separate launch audit.

Rollback restores an immutable revision into a new draft version; Publish must be confirmed separately. It restores content, not live destination/link state, so paused links never resume automatically. The next publish snapshots currently active, non-expired campaigns, rather than resurrecting archived ones. It also projects current system-link/destination pause states into static card visibility; resume becomes visible only after another publish, but server redirect state changes immediately. Idempotent seed uses INSERT OR IGNORE and never overwrites admin content or pauses.

## Backup and restore

Owner-only export contains destination configuration, redirects, drafts, revisions, jobs, settings, daily aggregates and audit; no raw visitor records. Store it securely, not in public files. Use D1 provider backup/export before migration. D1 Time Travel availability depends on the account plan; do not promise a universal retention window.

Restore into a **separate** migrated database first, preserving foreign-key order: destinations, redirects, drafts, revisions, publish_jobs, settings, daily aggregates, audit. Validate immutable source URLs, paused/archived states, draft schema, counts and a sampled redirect. Production restore requires explicit approval and maintenance coordination. In-flight jobs from an old export must be reconciled against CI before serving traffic; do not blindly redispatch them. Isolated SQLite export/restore is covered by tests; real remote disaster recovery remains unverified.

## QA-only landing fixture

`npx cross-env ALLOW_LOCAL_CONTENT_FIXTURE=true node scripts/admin-tools.mjs fixture` writes a clearly labelled local content snapshot. `fixture-seed` generates one local SQL campaign for redirect testing. Never run these in CI/production. After QA, `node scripts/admin-tools.mjs reset` and rebuild return to source defaults. Remove only the exact QA row from local D1 after checking its ID; do not reset or overwrite the database. No campaign is considered remotely published by this fixture.

## Online gates not established by local tests

Actual owner Google/MFA login and Access policy precedence; bypass-host rejection at Cloudflare edge; CI secrets/environment approvals and remote rollback; UK/DE/FR redirect p95 <=300ms; provider backup recovery; AdsBot accessibility and ad approval. Local measurements do not substitute for these checks.
