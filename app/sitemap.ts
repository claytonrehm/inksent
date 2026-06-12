import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'

// Only the public, indexable pages. Operational/account routes are excluded
// (and disallowed in robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '', '/order', '/apply', '/join', '/partners', '/partners/apply',
    '/notary-signing-service-san-diego', '/notary-signing-agent-jobs-san-diego',
    '/faq', '/privacy', '/terms', '/notary-agreement',
  ]
  const high = new Set(['/order', '/apply', '/join', '/partners', '/notary-signing-service-san-diego', '/notary-signing-agent-jobs-san-diego'])
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : high.has(path) ? 0.8 : 0.5,
  }))
}
