import {defineConfig,devices} from '@playwright/test'
export default defineConfig({
 testDir:'tests',testMatch:'password-ui.spec.ts',workers:1,timeout:60000,
 use:{baseURL:'http://127.0.0.1:5393',trace:'on-first-retry'},
 webServer:{command:'npx cross-env NODE_ENV=test PASSWORD_AUTH_FIXTURE=true node scripts/admin-ui-fixture.mjs',url:'http://127.0.0.1:5393/__fixture__/ready',reuseExistingServer:false},
 projects:[{name:'password-owner',use:{...devices['Desktop Chrome']}}]
})
