import {defineConfig,devices} from '@playwright/test'
export default defineConfig({
 testDir:'tests',testMatch:'admin-ui.spec.ts',timeout:60000,
 use:{baseURL:'http://127.0.0.1:5392',trace:'on-first-retry'},
 webServer:{command:'npx cross-env NODE_ENV=test node scripts/admin-ui-fixture.mjs',url:'http://127.0.0.1:5392/__fixture__/ready',reuseExistingServer:false},
 projects:[{name:'owner-fixture',use:{...devices['Desktop Chrome']}}]
})
