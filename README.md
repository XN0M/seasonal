# Seasonal Affiliate Hub

Astro + strict TypeScript + Tailwind CSS v4 + small React islands. The preview is intentionally `noindex` and contains no active affiliate link.

## Local commands

```bash
npm ci
npm run dev
npm run build
npm test
npm run test:e2e
npm run test:links
```

Development: `http://localhost:5178/en-gb/`. Production QA preview: `http://localhost:5180/en-gb/`.

See [plan.md](plan.md) for progress and blockers, [QA report](docs/qa/report.md) for measured results, and [runbook](docs/runbook.md) for data onboarding, environment setup, deployment and rollback. Header navigation uses native HTML and a small script; React hydrates the Gift Finder and configured consent UI only.

## Seasonal presentation

Christmas and Black Friday use event backgrounds and self-hosted vector Lottie decorations with the SVG light player (`lottie-web` 5.13.0). Six homepage placements / four event-hub placements share one controller, capped at three moving compositions on desktop and two on mobile (Santa counts toward this budget). Header runs once; all offscreen/background-tab decoration pauses. Finder has only header/footer decoration; editorial/policy pages are static.

**Effects on/off** lives in the desktop header or mobile menu, saving a device-local preference. Default `auto` honours reduced motion; an explicit `on` overrides only decoration with a localized notice. Old `off` preferences migrate; old `on` is not considered override consent. Christmas has 12 desktop / 6 mobile snow particles and a three-second, once-per-session Santa pass plus **Replay Santa**. When effects are off, its controls explain why and offer Enable effects. Blocked storage, failed assets or no JavaScript never prevent gift browsing; static posters remain available.

Configuration/copy: `src/lib/seasonal/themes.ts`; lifecycle: `src/lib/seasonal/client.ts`; reusable renderer: `SeasonalDecoration.astro`; hero snow/Santa: `SeasonalScene.astro`; backgrounds/safe zones: `seasonal.css`. No additional React hydration, third-party decoration requests, inline-script CSP exceptions or new tracker. Halloween/Winter remain disabled. Built styles are CSP-hashed.

Asset/license records: [provenance](docs/assets/provenance.md) and the public [animation credits](public/animations/credits.html). Source archives are outside public output. Rebuild adapted assets with `node scripts/prepare-decorations.mjs` and posters with `node scripts/render-decoration-posters.mjs` (requires local Playwright Chromium). Unit tests validate unsupported features and gzip budgets. JSON budgets exclude SVG posters/player; total payload and runtime cost are additionally checked in Lighthouse.

Run `npm run audit:mobile -- --runs=3 --label=decor-christmas-on --effects=on` and `npm run audit:mobile -- http://127.0.0.1:5180/en-gb/events/black-friday/ --runs=3 --label=decor-black-friday-on --effects=on` for independent three-run mobile lab batches with actual Lottie loading. The helper uses isolated Chrome profiles, saves only the functional Effects preference, and clears HTTP cache before each audit. Omit `--effects` for device-default behaviour (which can be static when the host prefers reduced motion); the on-audit verifies that JSON was fetched, rather than silently testing a static page. Reports/summary JSON are generated in `docs/qa/` (ignored). [Latest QA](docs/qa/decorations-report.md) and tracked screenshot references record evidence; the previous Christmas report is retained as history. TBT is not field INP.

## Launch gates

Replace the working name, set `PUBLIC_SITE_URL`, add authorised product imagery, allowlisted merchants, market-specific active offers and human-reviewed German/French copy. Remove `noindex` only after the Phase 6 acceptance report is complete.
