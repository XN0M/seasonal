import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:5180', trace: 'on-first-retry' },
  webServer: { command: 'npx cross-env ASTRO_TELEMETRY_DISABLED=1 astro preview --host 127.0.0.1 --port 5180 --ignore-lock', url: 'http://127.0.0.1:5180/en-gb/', reuseExistingServer: true },
  reporter: [['list'],['json',{outputFile:'test-results/results.json'}]],
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
})
