/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string
  readonly PUBLIC_GA_ID?: string
  readonly PUBLIC_META_PIXEL_ID?: string
  readonly PUBLIC_GOOGLE_ADS_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
