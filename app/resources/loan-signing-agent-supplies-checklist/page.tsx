import Link from 'next/link'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { articleSchema } from '@/lib/seo'

const SLUG = 'loan-signing-agent-supplies-checklist'
const TITLE = 'Loan Signing Agent Supplies: The Complete Checklist'
const DESC = 'Everything a notary signing agent needs to start and run loan signings — printer, scanner, stamp, journal, insurance, and the must-haves for the table.'

export const metadata = {
  title: `${TITLE} | Inksent`,
  description: DESC,
  alternates: { canonical: `/resources/${SLUG}` },
  keywords: ['loan signing agent supplies', 'notary signing agent equipment', 'what do I need to be a signing agent', 'notary supplies checklist'],
}

const GEAR = [
  ['Dual-tray laser printer', 'Loan packages mix legal (8.5×14) and letter (8.5×11) paper. A dual-tray laser printer lets you print the whole package fast and correctly — this is the single most important purchase.'],
  ['Mobile scanner', 'For scan-backs — many title companies require you to scan key documents before shipping. A portable sheet-fed scanner is faster than a phone app.'],
  ['Notary stamp & journal', 'Your state-required seal and a bound journal to log every notarization. Keep them with you at all times.'],
  ['Reliable transportation', 'You travel to the signer — a dependable vehicle and GPS are non-negotiable.'],
  ['A phone that receives texts', 'Most signings are dispatched and accepted by text. Keep it charged and on.'],
  ['Plenty of paper, toner & pens', 'Run out mid-package and you miss the appointment. Keep legal + letter paper and spare toner stocked; bring several blue or black pens.'],
  ['E&O insurance', 'Errors & omissions coverage protects you and is required by most title companies. Carry your certificate.'],
  ['Professional bag & backup', 'A clean folio, a backup printer or nearby print option, and a calm, professional appearance.'],
]

export default function Page() {
  return (
    <MarketingShell cta={{ href: '/apply', label: 'Apply Now' }}>
      <JsonLd data={articleSchema({ title: TITLE, description: DESC, slug: SLUG, datePublished: '2026-06-12' })} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">For notaries</p>
        <h1 className="text-4xl font-black leading-tight mb-5">{TITLE}</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Showing up to a loan signing prepared is what separates the agents who get repeat work from the ones who don&apos;t. Here&apos;s everything you need to start — and to never be caught short at the table.
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          {GEAR.map(([h, b], i) => (
            <section key={h}>
              <h2 className="text-xl font-black text-gray-900 mb-1">{i + 1}. {h}</h2>
              <p>{b}</p>
            </section>
          ))}
        </div>

        <p className="text-gray-700 leading-relaxed mt-8">
          New to this? Start with our guides on <Link href="/resources/how-to-become-a-notary-signing-agent-in-california" className="text-violet-600 underline">becoming a signing agent in California</Link> and <Link href="/resources/how-to-get-more-loan-signing-jobs" className="text-violet-600 underline">getting more signing jobs</Link>.
        </p>

        <div className="mt-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-7 text-white text-center">
          <h2 className="text-xl font-black mb-2">Got your kit? Start earning.</h2>
          <p className="text-violet-100 mb-4">Join Inksent — $90 per signing, jobs by text, paid automatically. Free to join.</p>
          <Link href="/apply" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 inline-block">Apply Now</Link>
        </div>
      </article>
    </MarketingShell>
  )
}
