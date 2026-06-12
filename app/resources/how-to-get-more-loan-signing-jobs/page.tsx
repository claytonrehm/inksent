import Link from 'next/link'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { articleSchema } from '@/lib/seo'

const SLUG = 'how-to-get-more-loan-signing-jobs'
const TITLE = 'How to Get More Loan Signing Jobs as a Notary'
const DESC = 'Practical ways notary signing agents get more steady signing work — joining signing services, being reliable, widening coverage, and standing out.'

export const metadata = {
  title: `${TITLE} | Inksent`,
  description: DESC,
  alternates: { canonical: `/resources/${SLUG}` },
  keywords: ['how to get more loan signing jobs', 'get notary signing work', 'more signing agent jobs', 'how to get signing agent work'],
}

export default function Page() {
  return (
    <MarketingShell cta={{ href: '/apply', label: 'Apply Now' }}>
      <JsonLd data={articleSchema({ title: TITLE, description: DESC, slug: SLUG, datePublished: '2026-06-12' })} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">For notaries</p>
        <h1 className="text-4xl font-black leading-tight mb-5">{TITLE}</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          The notaries who stay busy aren&apos;t necessarily the most experienced — they&apos;re the ones who make themselves easy to hire and easy to rely on. Here&apos;s how to get more loan signings coming your way.
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">1. Get on multiple signing-service rosters</h2>
            <p>Most loan-signing volume flows through signing services and title companies, not walk-up clients. The more rosters you&apos;re on, the more jobs reach you. Sign up with several so you&apos;re never depending on one source — and prioritize ones that pay fairly and pay <em>fast</em>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">2. Respond fast — it&apos;s the #1 thing</h2>
            <p>On most platforms, the first qualified agent to accept gets the job. Notifications you answer in minutes turn into signings; ones you see hours later are already taken. Keep your phone on, and accept (or decline) quickly so dispatchers learn you&apos;re dependable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">3. Be flawless at the table</h2>
            <p>Nothing kills your job flow like a kicked-back package. Double-check every signature, initial, date, and notarization before you leave. Agents who never get packages returned get sent the most work — reliability is your reputation.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">4. Widen your coverage (sensibly)</h2>
            <p>The bigger the area you&apos;ll cover, the more jobs you qualify for. A dual-tray printer (so you can take any loan package), willingness to drive a reasonable radius, and evening/weekend availability all expand the pool of signings you can accept.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">5. Speak a second language</h2>
            <p>Bilingual signing agents are in demand and frequently matched to signings that need them — an easy edge if you have it.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">6. Join a network that sends you the work</h2>
            <p>The simplest path to steady jobs is partnering with a dispatch service that markets to title companies for you. <strong>Inksent</strong> texts you signings in the areas you cover, pays a flat <strong>$90 per completed signing</strong> automatically by direct deposit, and is free to join — you set your own coverage and schedule. <Link href="/apply" className="text-violet-600 underline font-semibold">Apply to join the network</Link> in about 3 minutes.</p>
          </section>
        </div>

        <div className="mt-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-7 text-white text-center">
          <h2 className="text-xl font-black mb-2">Get signings sent to you</h2>
          <p className="text-violet-100 mb-4">Join Inksent — jobs by text, $90 each, paid automatically. Free to join.</p>
          <Link href="/apply" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 inline-block">Apply Now</Link>
        </div>
      </article>
    </MarketingShell>
  )
}
