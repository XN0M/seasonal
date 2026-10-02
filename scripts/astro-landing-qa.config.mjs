// Isolated QA build: never replace src/generated/content.json or the owner preview dist.
import {defineConfig} from 'astro/config'
import {fileURLToPath} from 'node:url'
import config from '../astro.config.mjs'
export default defineConfig({...config,
 outDir:fileURLToPath(new URL('../.wrangler/landing-qa-dist/',import.meta.url)),
 vite:{...config.vite,resolve:{alias:[{find:'../generated/content.json',replacement:fileURLToPath(new URL('../.wrangler/tools/landing-content.json',import.meta.url))}]}}
})
