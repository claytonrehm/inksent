import Link from 'next/link'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { articleSchema } from '@/lib/seo'

const SLUG = 'how-title-companies-choose-a-signing-service'
const TITLE = 'How Title Companies Choose a Notary Signing Service'
const DESC = 'What title and escrow teams should look for in a notary signing service: agent vetting, turnaround time, backup-on-cancel, document handling, live tracking, and transparent pricing.'

export const metadata = {
  title: `${TITLE} | Inksent`,
  description: DESC,
  alternates: { canonical: `/resources/${SLUG}` },
  keywords: ['notary signing service', 'choose a signing service', 'title company signing agent', 'escrow notary service', 'loan signing service comparison'],
}

const CRITERIA = [
  ['Vetting and credentials', 'Every agent at the table should be NNA-certified, background-checked, and E&O-insured — and those credentials should be verified before each job, not just at signup. Ask how lapsed credentials are handled. A service that auto-blocks expired agents protects you from liability.'],
  ['Turnaround time', 'How fast is an agent confirmed? Sequential calling down a list wastes hours. Services that alert every qualified agent at once and confirm in ~30 minutes keep your closings on schedule.'],
  ['Backup when an agent cancels', 'Cancellations happen. The question is what happens next. The best services automatically re-offer the job to other covering agents instead of leaving your team to scramble for a replacement at the last minute.'],
  ['Document handling', 'Loan packages change. Look for secure upload, automatic delivery to whoever is assigned (including a backup), and version control so no one ever signs a stale package after a lender re-send.'],
  ['Visibility and tracking', 'You and the borrower should be able to see real-time status — confirmed, en route, complete — without calling for updates. Live tracking cuts down on status emails and surprises.'],
  ['Transparent, flat pricing', 'Watch for surprise trip fees, minimums, and contracts. A flat per-signing rate with simple card/ACH payment is easier to budget and reconcile.'],
  ['Coverage and communication', 'Do they actually staff your areas, and can you reach a real person when something is urgent? Honest coverage (no overpromising) and responsive support matter more than a flashy portal.'],
]

export default function Page() {
  return (
    <MarketingShell cta={{ href: '/order', label: 'Place an Order' }}>
      <JsonLd data={articleSchema({ title: TITLE, description: DESC, slug: SLUG, datePublished: '2026-06-11' })} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">For title &amp; escrow</p>
        <h1 className="text-4xl font-black leading-tight mb-5">{TITLE}</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          A signing agent is the last person your borrower sees before a loan funds — so the signing service you choose directly affects your closings, your liability, and your reputation. Here are the criteria the best title and escrow teams use to evaluate one.
        </p>

        <div className="space-y-7 text-gray-700 leading-relaxed">
          {CRITERIA.map(([h, b], i) => (
            <section key={h}>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{i + 1}. {h}</h2>
              <p>{b}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 border border-violet-100 bg-violet-50 rounded-2xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-2">How Inksent measures up</h2>
          <p className="text-gray-700 leading-relaxed">
            Inksent dispatches only vetted, NNA-certified, background-checked, E&amp;O-insured agents — re-verified before every job — confirms most signings in about 30 minutes, automatically re-offers a cancelled job to other covering agents, re-routes documents so no one signs a stale package, and gives you live tracking. Flat $185 per signing, no contracts or minimums. See it in action or place an order below.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/order" className="inline-flex items-center justify-center bg-violet-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-violet-700">Place a Signing Order</Link>
          <Link href="/partners" className="inline-flex items-center justify-center border border-gray-300 px-6 py-3.5 rounded-xl font-bold text-gray-800 hover:bg-gray-50">See How It Works</Link>
        </div>
      </article>
    </MarketingShell>
  )
}
