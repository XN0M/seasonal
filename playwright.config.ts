import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  testIgnore: ['**/admin-ui.spec.ts','**/password-ui.spec.ts'],
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:5181', trace: 'on-first-retry' },
  webServer: { command: 'npm run db:local && npm run preview:worker', url: 'http://127.0.0.1:5181/en-gb/', reuseExistingServer: true },
  reporter: [['list'],['json',{outputFile:'test-results/results.json'}]],
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
})
