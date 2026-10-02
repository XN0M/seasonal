# Single-owner password login QA — 2026-10-02

Follow-up at owner's request: minimum length reduced from 15 to 1 (non-empty), maximum 128 retained. Server/setup/CLI tests explicitly cover one-character passwords and reject empty/overlong input; prior results below describe the original policy. Existing credentials and all session/CSRF/rate-limit controls remain unchanged.

Scope: local only. Owner selected native email/password authentication. No actual owner password was supplied to or chosen by the agent; the loopback setup form awaits a new password entered by the owner privately. No production deployment, remote database or Access policy changed.

## Implemented boundary

- Explicit password mode; exact owner and origin, no public registration or silent Access fallback. Build-service signed Access JWT remains independent.
- Salted scrypt N=16384/r=8/p=5, 32-byte derived hash; no plaintext password or command-line password argument.
- One-hour random 256-bit sessions stored as keyed hashes. Host-only HttpOnly/Strict cookies; HTTPS Secure `__Host-` variant, no Domain attribute.
- Exact Origin/JSON checks for login/setup and per-session CSRF for writes/logout. Logout revokes server session; password reset versions invalidate sessions.
- Atomic D1 account-wide five attempts per 15-minute window, reserved before password hashing. No submitted email/password/IP in failed-login audit.
- First setup only with explicit flag on HTTP 127.0.0.1 and no credential row. Never online bootstrap, even if flag is accidentally enabled remotely.
- Masked PowerShell operator reset (stdin); prepare-only mode for separately approved remote import. Repeated seed/deploy does not reset credentials.

## Evidence

- 67/67 unit/integration tests pass, including concurrent login reservations, fake cookies/headers, wrong email/host, expiry, CSRF, missing configuration, unavailable D1 and operator credential reset.
- Strict Astro/TypeScript check: 133 files, zero diagnostics. Source build: 90 routes; link/noindex check: 92 HTML files and 10,147 references.
- 2/2 image tests; existing 20 product images retained.
- 1/1 password browser flow: first setup, wrong password, keyboard submit, actual admin access, native cookie flags, logout and post-logout rejection. Axe and overflow checks at 375/768/1024/1440. Screenshots `password-login-{width}.png` saved; 375px visually reviewed.
- 2/2 previous signed-Access admin UI tests pass in separate test harness.
- Separate real Wrangler/D1 fixture on loopback 5394: native scrypt setup, login, private asset access, missing-CSRF rejection, valid logout and rejected old cookie all pass. Login full HTTP 193.4ms in this isolated local measurement; not a production CPU/latency promise. Actual owner database was not used for this fixture.
- Worker dry-run passes: 900.92 KiB /155.20 KiB gzip. No upload/deployment.
- Public browser regression: original batch 59 passed, 2 unpublished-landing skips, 1 mobile gallery expectation failed during the period when a concurrent build had been running. The unchanged case passed on an explicit post-build rerun (1/1). A transient asset/reload race is suspected, not conclusively established. Original batch is not a clean all-pass run; its failure is retained rather than hidden.

## Limits and activation gates

Password-only login is not MFA or phishing resistant. Account-wide rate limiting can be intentionally exhausted to deny the owner temporarily; production needs edge abuse controls. Scrypt runtime CPU/plan limits, HTTPS browser session behaviour, actual D1 and backup/restore must be verified on staging. Hash cost must not be weakened to fit a free CPU budget. No new Lighthouse claims made for this private-only change; public frontend JavaScript/layout unchanged.

The active owner local database has no agent-created credential; open `http://127.0.0.1:5181/_manage/`, enter the configured owner email and a NEW 15–128-character password twice, then sign in. This does not activate admin on evenal.click. Keep `.dev.vars` and generated credential SQL out of Git. Historical Access implementation QA remains intact.
