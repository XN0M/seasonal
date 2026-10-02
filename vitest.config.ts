import { defineConfig } from 'vitest/config'
import {readFileSync} from 'node:fs'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins:[{name:'private-worker-text',enforce:'pre',load(id){if(id.endsWith('.txt'))return 'export default '+JSON.stringify(readFileSync(id,'utf8'));return null}}],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'], exclude: ['tests/**/*.spec.ts'] },
})
