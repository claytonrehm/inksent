import Link from 'next/link'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { articleSchema } from '@/lib/seo'

const SLUG = 'notary-signing-agent-vs-mobile-notary'
const TITLE = 'Notary Signing Agent vs. Mobile Notary: What’s the Difference?'
const DESC = 'Mobile notary vs. notary signing agent (NSA): what each does, the training and pay differences, and which path earns more in real estate.'

export const metadata = {
  title: 'Notary Signing Agent vs. Mobile Notary — What’s the Difference? | Inksent',
  description: DESC,
  alternates: { canonical: `/resources/${SLUG}` },
  keywords: ['notary signing agent vs mobile notary', 'what is a notary signing agent', 'mobile notary vs loan signing agent', 'NSA vs notary'],
}

export default function Page() {
  return (
    <MarketingShell cta={{ href: '/apply', label: 'Apply Now' }}>
      <JsonLd data={articleSchema({ title: TITLE, description: DESC, slug: SLUG, datePublished: '2026-06-12' })} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">For notaries</p>
        <h1 className="text-4xl font-black leading-tight mb-5">Notary Signing Agent vs. Mobile Notary: What&apos;s the Difference?</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          People use these terms interchangeably, but they&apos;re not the same thing — and the difference matters for how much you can earn. Here&apos;s the plain-English breakdown.
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Mobile notary</h2>
            <p>A <strong>mobile notary</strong> is a commissioned notary public who travels to the customer to notarize documents — anything from a power of attorney to a single affidavit or a DMV form. They charge per notarization (capped by state law) plus a travel fee. It&apos;s general-purpose notary work, and the volume comes from all kinds of everyday documents.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Notary signing agent (NSA)</h2>
            <p>A <strong>notary signing agent</strong> is a mobile notary who has gone a step further to specialize in <strong>real-estate loan signings</strong> — guiding borrowers through an entire mortgage package (purchase, refinance, HELOC, etc.). NSAs are typically <strong>NNA-certified, background-screened, and E&amp;O-insured</strong> because they handle sensitive financial documents for lenders and title companies. The work is more specialized, the packages are 100+ pages, and the pay per appointment is higher.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">The key differences</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-100 rounded-lg">
                <thead className="bg-gray-50 text-left text-gray-500"><tr><th className="p-3"></th><th className="p-3">Mobile notary</th><th className="p-3">Signing agent (NSA)</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="p-3 font-semibold">Documents</td><td className="p-3">General (POAs, affidavits, forms)</td><td className="p-3">Full loan-closing packages</td></tr>
                  <tr><td className="p-3 font-semibold">Certification</td><td className="p-3">State commission</td><td className="p-3">+ NNA cert, background check, E&amp;O</td></tr>
                  <tr><td className="p-3 font-semibold">Pay</td><td className="p-3">Per-notarization + travel</td><td className="p-3">Flat per-signing ($75–$200)</td></tr>
                  <tr><td className="p-3 font-semibold">Who hires</td><td className="p-3">Individuals, businesses</td><td className="p-3">Title/escrow companies, lenders, signing services</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Which earns more?</h2>
            <p>Generally the <strong>signing-agent path</strong> — loan signings pay more per appointment than a typical general notarization, and there&apos;s steady demand from the mortgage industry. Most NSAs start as mobile notaries and add the loan-signing specialty. If you want to maximize income, getting NSA-certified and on signing-service rosters is the move. Here&apos;s our step-by-step on <Link href="/resources/how-to-become-a-notary-signing-agent-in-california" className="text-violet-600 underline">becoming a signing agent in California</Link>.</p>
          </section>
        </div>

        <div className="mt-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-7 text-white text-center">
          <h2 className="text-xl font-black mb-2">Ready to do loan signings?</h2>
          <p className="text-violet-100 mb-4">Join Inksent and get $90-per-signing loan-signing jobs by text in your area.</p>
          <Link href="/apply" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 inline-block">Apply Now</Link>
        </div>
      </article>
    </MarketingShell>
  )
}
