import { notFound } from 'next/navigation'
import DemoPage from '@/app/demo/page'
import { DEMO_BRANDS } from '@/lib/demo-brands'

// Short branded demo links — inksent.co/d/pickford renders the same demo, branded
// for that company, with a clean URL (no query string). Slugs in lib/demo-brands.ts.
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Live Demo — Inksent', robots: { index: false, follow: false } }

export default async function BrandDemo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const b = DEMO_BRANDS[slug.toLowerCase()]
  if (!b) notFound()
  return DemoPage({
    searchParams: Promise.resolve({ co: b.co, contact: b.contact, email: b.email, domain: b.domain, logo: b.logo }),
  })
}
