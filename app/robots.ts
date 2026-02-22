import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/profile/',
        '/auth/',
        '/invoices/',
        '/gate-pass/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
