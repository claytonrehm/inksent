import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'

// Allow crawling of the public marketing/legal pages; keep every operational,
// admin, account, and capability-link surface out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin-login',
        '/dashboard',
        '/notaries',
        '/orders',
        '/invoices',
        '/coverage',
        '/reports',
        '/leads',
        '/activity',
        '/setup',
        '/portal',
        '/hub',
        '/login',
        '/demo',
        '/d/',
        '/feedback-thanks',
        '/track/',
        '/upload/',
        '/onboard/',
        '/accept/',
        '/complete/',
        '/docs/',
        '/finish/',
        '/agent/',
        '/brand',
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
