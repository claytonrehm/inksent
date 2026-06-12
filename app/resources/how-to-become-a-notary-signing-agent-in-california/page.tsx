import Link from 'next/link'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { articleSchema } from '@/lib/seo'

const SLUG = 'how-to-become-a-notary-signing-agent-in-california'
const TITLE = 'How to Become a Notary Signing Agent in California'
const DESC = 'A step-by-step guide to becoming a notary signing agent (NSA) in California — commission, NNA certification, background check, E&O insurance, equipment, and how to start earning.'

export const metadata = {
  title: `${TITLE} | Inksent`,
  description: DESC,
  alternates: { canonical: `/resources/${SLUG}` },
  keywords: ['how to become a notary signing agent in California', 'become a loan signing agent California', 'NSA certification California', 'California notary signing agent requirements'],
}

export default function Page() {
  return (
    <MarketingShell cta={{ href: '/apply', label: 'Apply Now' }}>
      <JsonLd data={articleSchema({ title: TITLE, description: DESC, slug: SLUG, datePublished: '2026-06-11' })} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">For notaries · California</p>
        <h1 className="text-4xl font-black leading-tight mb-5">{TITLE}</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          A notary signing agent (NSA) is a notary public trained to handle loan-document signings for real estate closings — purchases, refinances, HELOCs, and more. In California it&apos;s one of the most flexible ways to earn as a notary, with signings commonly paying $90 and up. Here&apos;s exactly how to get started.
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">1. Get your California notary commission</h2>
            <p className="mb-3">Before you can do loan signings, you need an active California notary public commission. The state&apos;s steps are:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Be at least 18 and a legal California resident.</li>
              <li>Complete a state-approved <strong>6-hour notary education course</strong> (a 3-hour refresher is allowed for renewals).</li>
              <li>Pass the <strong>state notary exam</strong> (proctored for the California Secretary of State).</li>
              <li>Submit fingerprints via <strong>Live Scan</strong> for a background check.</li>
              <li>Once commissioned, file your <strong>oath of office and a $15,000 surety bond</strong> with your county clerk within 30 days.</li>
              <li>Buy your <strong>notary seal/stamp and a journal</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">2. Get certified as a signing agent</h2>
            <p className="mb-3">Title companies and lenders expect signing agents to be certified and screened. The industry standard is the National Notary Association (NNA):</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Pass the <strong>NNA Signing Agent certification exam</strong> (renewed annually).</li>
              <li>Complete the <strong>NNA background screening</strong>, which lenders rely on under federal privacy rules.</li>
            </ul>
            <p className="mt-3">This certification is what lets you accept the loan signings that pay the most.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">3. Carry E&amp;O insurance</h2>
            <p>Errors &amp; omissions (E&amp;O) insurance protects you if a mistake is made during a signing. Many title companies require it, and coverage from $25,000 up to $100,000+ is common. It&apos;s inexpensive and signals professionalism.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">4. Get the right equipment</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>A <strong>dual-tray laser printer</strong> — loan packages mix legal and letter paper.</li>
              <li>A <strong>mobile scanner</strong> for scan-backs.</li>
              <li>Reliable transportation and a phone that receives texts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">5. Start getting signings</h2>
            <p className="mb-3">Once you&apos;re commissioned, certified, screened, and insured, the final step is connecting with the companies that send out signings. Signing services match you to nearby jobs so you don&apos;t have to market yourself.</p>
            <p>
              <strong>Inksent</strong> is a local signing network that texts you jobs in the ZIP codes you cover, pays a flat <strong>$90 per completed signing</strong> by direct deposit, and charges no membership fees. You set your own coverage and schedule. <Link href="/apply" className="text-violet-600 underline font-semibold">Apply to join the network</Link> — it takes about 3 minutes.
            </p>
          </section>
        </div>

        <div className="mt-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-7 text-white text-center">
          <h2 className="text-xl font-black mb-2">Ready to earn $90 per signing?</h2>
          <p className="text-violet-100 mb-4">Join Inksent and start getting loan-signing jobs by text in your area.</p>
          <Link href="/apply" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 inline-block">Apply Now</Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">This guide is general information, not legal advice. Always confirm current requirements with the California Secretary of State.</p>
      </article>
    </MarketingShell>
  )
}
