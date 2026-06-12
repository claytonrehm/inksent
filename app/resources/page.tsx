import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MarketingShell from '@/components/MarketingShell'

export const metadata = {
  title: 'Resources — Notary Signing Agents & Title Companies | Inksent',
  description:
    'Guides for notary signing agents and title/escrow teams: how to become a signing agent in California, how title companies choose a signing service, and more.',
  alternates: { canonical: '/resources' },
}

export const ARTICLES = [
  {
    slug: 'how-to-become-a-notary-signing-agent-in-california',
    title: 'How to Become a Notary Signing Agent in California',
    blurb: 'Step-by-step: get your commission, NNA certification, background check, and E&O insurance — and start earning $90 per signing.',
    audience: 'For notaries',
  },
  {
    slug: 'how-title-companies-choose-a-signing-service',
    title: 'How Title Companies Choose a Notary Signing Service',
    blurb: 'What escrow and title teams should look for: vetting, turnaround time, backup-on-cancel, tracking, and transparent pricing.',
    audience: 'For title & escrow',
  },
] as const

export default function ResourcesPage() {
  return (
    <MarketingShell cta={{ href: '/order', label: 'Place an Order' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-3">Resources</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">Practical guides for notary signing agents and the title &amp; escrow teams who hire them.</p>
        <div className="space-y-5">
          {ARTICLES.map((a) => (
            <Link key={a.slug} href={`/resources/${a.slug}`} className="block border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-violet-200 hover:shadow-md transition">
              <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">{a.audience}</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1.5 mb-2">{a.title}</h2>
              <p className="text-gray-600 mb-3">{a.blurb}</p>
              <span className="inline-flex items-center gap-1.5 text-violet-600 font-semibold text-sm">Read more <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </div>
    </MarketingShell>
  )
}
