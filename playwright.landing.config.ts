import {defineConfig,devices} from '@playwright/test'
process.env.LANDING_QA_DIR='.wrangler/landing-qa-dist'
export default defineConfig({
 testDir:'tests',testMatch:'landing.spec.ts',timeout:60000,
 use:{baseURL:'http://127.0.0.1:5394',trace:'on-first-retry'},
 webServer:{command:'npx cross-env WRANGLER_SEND_METRICS=false WRANGLER_LOG_PATH=.wrangler/logs WRANGLER_REGISTRY_PATH=.wrangler/registry wrangler dev --env local --local --ip 127.0.0.1 --port 5394 --persist-to .wrangler/custom-link-runtime --assets .wrangler/landing-qa-dist --var ADMIN_ORIGIN:http://127.0.0.1:5394 --var OWNER_EMAIL:owner@example.invalid --var ADMIN_AUTH_MODE:password --var ADMIN_LOCAL_SETUP:false --var CSRF_SECRET:fixture-only-secret-at-least-32-characters',url:'http://127.0.0.1:5394/en-gb/',reuseExistingServer:false},
 projects:[{name:'mobile',use:{...devices['iPhone 13'],browserName:'chromium'}},{name:'desktop',use:{...devices['Desktop Chrome']}}]
})
