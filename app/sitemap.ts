import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.com'
  const supabase = createAdminClient()

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/auctions',
    '/about',
    '/buyers',
    '/sellers',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. Fetch all live events
  const { data: events } = await supabase
    .from('auction_events')
    .select('id, updated_at')
    .neq('status', 'draft')

  const eventRoutes = (events || []).map((event) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: new Date(event.updated_at || Date.now()),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }))

  // 3. Fetch all live auctions (lots)
  const { data: lots } = await supabase
    .from('auctions')
    .select('id, updated_at')
    .eq('status', 'live')

  const lotRoutes = (lots || []).map((lot) => ({
    url: `${baseUrl}/auctions/${lot.id}`,
    lastModified: new Date(lot.updated_at || Date.now()),
    changeFrequency: 'hourly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...eventRoutes, ...lotRoutes]
}
