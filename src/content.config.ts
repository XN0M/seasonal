import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const localized = z.object({ 'en-gb': z.string(), 'de-de': z.string(), 'fr-fr': z.string() })

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({ title: localized, eventId: z.string(), status: z.enum(['draft', 'review', 'published']), reviewedLocales: z.array(z.enum(['en-gb', 'de-de', 'fr-fr'])) }),
})

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({ title: localized, excerpt: localized, image:z.string(), category: z.string(), updatedAt:z.coerce.date(), status: z.enum(['draft', 'review', 'published']), sources: z.array(z.url()) }),
})

const policies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/policies' }),
  schema: z.object({ title: z.string(), updatedAt: z.coerce.date(), status: z.enum(['draft', 'published']) }),
})

export const collections = { events, guides, policies }
