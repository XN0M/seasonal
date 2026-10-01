import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const localized = z.object({ 'en-gb': z.string(), 'de-de': z.string(), 'fr-fr': z.string() })

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({ title: localized, eventId: z.string(), status: z.enum(['draft', 'review', 'published']), reviewedLocales: z.array(z.enum(['en-gb', 'de-de', 'fr-fr'])) }),
})

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides', generateId:({data})=>`${data.locale}/${data.slug}` }),
  schema: z.object({slug:z.string().regex(/^[a-z0-9-]+$/),locale:z.enum(['en-gb','de-de','fr-fr']),title:z.string().min(1),excerpt:z.string().min(1),image:z.string(),category:z.string(),updatedAt:z.coerce.date(),status:z.enum(['draft','review','published']),sources:z.array(z.url()).min(1),relatedBrandIds:z.array(z.string()).min(1)}),
})

const policies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/policies' }),
  schema: z.object({ title: z.string(), updatedAt: z.coerce.date(), status: z.enum(['draft', 'published']) }),
})

export const collections = { events, guides, policies }
