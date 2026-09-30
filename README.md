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

## Launch gates

Replace the working name, set `PUBLIC_SITE_URL`, add authorised product imagery, allowlisted merchants, market-specific active offers and human-reviewed German/French copy. Remove `noindex` only after the Phase 6 acceptance report is complete.
