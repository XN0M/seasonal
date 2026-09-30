import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

const configuredSite = process.env.PUBLIC_SITE_URL || undefined

export default defineConfig({
  ...(configuredSite ? {site:configuredSite} : {}),
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  markdown:{syntaxHighlight:'prism'},
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  security: { csp: { directives: ["default-src 'self'", "img-src 'self' data: https://www.facebook.com", "font-src 'self'", "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com https://www.googleadservices.com", "base-uri 'self'", "object-src 'none'", "form-action 'self'"], scriptDirective: { resources: ["'self'", 'https://www.googletagmanager.com', 'https://connect.facebook.net'] } } },
  integrations: [react()],
  vite: { plugins: [tailwindcss()],build:{assetsInlineLimit:0} },
})
