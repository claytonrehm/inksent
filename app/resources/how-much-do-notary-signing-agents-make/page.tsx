import Link from 'next/link'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { articleSchema } from '@/lib/seo'

const SLUG = 'how-much-do-notary-signing-agents-make'
const TITLE = 'How Much Do Notary Signing Agents Make?'
const DESC = 'A realistic look at notary signing agent income — per-signing fees, monthly earnings, what affects pay, the costs to factor in, and how to earn more.'

export const metadata = {
  title: `${TITLE} | Inksent`,
  description: DESC,
  alternates: { canonical: `/resources/${SLUG}` },
  keywords: ['how much do notary signing agents make', 'notary signing agent salary', 'loan signing agent income', 'notary signing agent pay'],
}

export default function Page() {
  return (
    <MarketingShell cta={{ href: '/apply', label: 'Apply Now' }}>
      <JsonLd data={articleSchema({ title: TITLE, description: DESC, slug: SLUG, datePublished: '2026-06-12' })} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">For notaries</p>
        <h1 className="text-4xl font-black leading-tight mb-5">{TITLE}</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Notary signing agent (NSA) income varies a lot — it depends on how many signings you do, your market, and how reliable you are. Here&apos;s an honest breakdown so you can set realistic expectations.
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Per-signing fees</h2>
            <p>Most loan signings pay an NSA somewhere between <strong>$75 and $200</strong>, depending on the loan type, the market, and who&apos;s hiring. Refinances are often on the lower end; purchases and complex packages (reverse mortgage, seller packages) tend to pay more because they take longer and carry higher stakes. Signing services that handle dispatch typically pay a flat per-signing fee — for example, <strong>Inksent pays $90 per completed signing</strong>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">What that adds up to</h2>
            <p>The math is simple: <em>fee per signing × signings per month.</em> A few realistic scenarios:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong>Side income:</strong> 2–3 signings/week ≈ $700–$1,200/month.</li>
              <li><strong>Part-time:</strong> 1–2 signings/day a few days a week ≈ $1,500–$3,000/month.</li>
              <li><strong>Full-time &amp; established:</strong> 4–6 signings/day with steady volume ≈ $5,000+/month.</li>
            </ul>
            <p className="mt-3">The catch: volume isn&apos;t guaranteed. Income depends on demand in your area and how many sources send you work.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Costs to factor in</h2>
            <p>You&apos;re an independent contractor, so subtract your business costs: E&amp;O insurance, NNA certification/renewal, background check, printer + toner + paper, a mobile scanner, gas/mileage, and self-employment taxes. The upside — <strong>mileage and supplies are deductible</strong>, which meaningfully lowers your taxable income if you track them. (Inksent agents get a free dashboard that logs mileage and exports tax-ready reports automatically.)</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">How to earn more</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Get on multiple signing-service lists</strong> so more jobs come your way.</li>
              <li><strong>Be reliable and fast to respond</strong> — the agents who accept quickly and never flake get sent the most work.</li>
              <li><strong>Own a dual-tray printer</strong> so you can take any loan package.</li>
              <li><strong>Speak a second language</strong> — bilingual agents get matched to more signings.</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-7 text-white text-center">
          <h2 className="text-xl font-black mb-2">Want steady signings at $90 each?</h2>
          <p className="text-violet-100 mb-4">Join Inksent — jobs come by text, you&apos;re paid automatically by direct deposit, and it&apos;s free to join.</p>
          <Link href="/apply" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 inline-block">Apply Now</Link>
        </div>
        <p className="text-xs text-gray-400 mt-8">General information, not financial advice. Earnings vary by market, volume, and effort.</p>
      </article>
    </MarketingShell>
  )
}
