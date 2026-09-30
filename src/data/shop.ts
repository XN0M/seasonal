import { brands, merchants, offers } from './catalog'
import { resolveCommerceCard } from '@/lib/commerce'
import type { Market, Product } from '@/lib/types'

export const commerceCard = (product: Product, market: Market) => resolveCommerceCard(product, market, { brands, merchants, offers })
