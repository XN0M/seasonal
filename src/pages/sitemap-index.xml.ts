import type {APIRoute} from 'astro'
import {localeCodes} from '@/lib/types'
export const GET:APIRoute=()=>{
 const site=import.meta.env.PUBLIC_SITE_URL
 const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;')
 const entries=site?localeCodes.map(locale=>`<sitemap><loc>${escape(new URL(`/sitemap-${locale}.xml`,site).href)}</loc></sitemap>`).join(''):''
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`,{headers:{'Content-Type':'application/xml'}})
}
