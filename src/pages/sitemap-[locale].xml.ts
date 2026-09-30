import type {APIRoute} from 'astro'
import {localeCodes} from '@/lib/types'
export const getStaticPaths=()=>localeCodes.map(locale=>({params:{locale}}))
// Preview pages intentionally remain outside the indexable sitemap.
export const GET:APIRoute=()=>new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',{headers:{'Content-Type':'application/xml'}})
