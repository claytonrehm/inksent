import Link from 'next/link'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { articleSchema } from '@/lib/seo'

const SLUG = 'reduce-signing-kickbacks-title-companies'
const TITLE = 'How Title Companies Can Reduce Signing Kickbacks'
const DESC = 'Signing kickbacks delay funding and frustrate borrowers. Here are the common causes — and how title and escrow teams cut them so loans fund faster.'

export const metadata = {
  title: `${TITLE} | Inksent`,
  description: DESC,
  alternates: { canonical: `/resources/${SLUG}` },
  keywords: ['reduce signing kickbacks', 'loan signing errors', 'title company signing quality', 'escrow signing fund faster', 'notary signing mistakes'],
}

const CAUSES = [
  ['Missed signatures, initials, or dates', 'The most common kickback. A single blank line on a required form sends the whole package back for a redraw and re-sign.'],
  ['Wrong or missing dates', 'Especially the right-of-rescission dates on refinances — get these wrong and the loan can\'t fund on time.'],
  ['Missing or out-of-order pages', 'A page that never printed, or a stale package after a lender re-send, means the borrower signs the wrong set.'],
  ['Name mismatches', 'A signature that doesn\'t match the name on the document, or inconsistent names across forms.'],
  ['Unvetted or unreliable agents', 'An inexperienced or lapsed-credential agent at the table is the root cause of most of the above.'],
]

export default function Page() {
  return (
    <MarketingShell cta={{ href: '/order', label: 'Place an Order' }}>
      <JsonLd data={articleSchema({ title: TITLE, description: DESC, slug: SLUG, datePublished: '2026-06-12' })} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">For title &amp; escrow</p>
        <h1 className="text-4xl font-black leading-tight mb-5">{TITLE}</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          A &ldquo;kickback&rdquo; — a signed package returned for errors — is one of the most expensive problems in a closing. It means a redraw, a re-drive, a frustrated borrower, and a loan that funds late. Most kickbacks are preventable. Here&apos;s how.
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Why kickbacks hurt so much</h2>
            <p>Every kickback restarts the clock: documents go back to the lender, a corrected package is drawn, the agent re-schedules with the borrower, and funding slips — sometimes past a rate-lock or a contractual deadline. On a purchase, a delayed signing can jeopardize the whole deal. The cost isn&apos;t just time; it&apos;s your reputation with the lender and the borrower.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">The usual causes</h2>
            <div className="space-y-4">
              {CAUSES.map(([h, b]) => (
                <div key={h}>
                  <h3 className="font-bold text-gray-900">{h}</h3>
                  <p>{b}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">How to cut them</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Use vetted agents only.</strong> NNA-certified, background-checked, experienced agents make far fewer errors. Confirm credentials are <em>current</em>, not just on file.</li>
              <li><strong>Control document delivery.</strong> Make sure the agent has the final package and that a lender re-send replaces the old one — so no one signs a stale set.</li>
              <li><strong>Require scan-backs</strong> on critical signings so you can confirm everything is signed before the package ships.</li>
              <li><strong>Pre-flight the package.</strong> A quick QC pass to map every signature, initial, date, and notarization — and catch blanks before the appointment — eliminates most kickbacks at the source.</li>
              <li><strong>Work with a reliable signing service</strong> that builds these safeguards in, so you&apos;re not managing it order by order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">How Inksent helps</h2>
            <p>Inksent dispatches only vetted, NNA-certified, background-checked, E&amp;O-insured agents — re-verified before every job — confirms a signer in about 30 minutes, automatically re-offers a cancelled job so you&apos;re never left scrambling, and re-routes documents so no one signs a stale package. The result: cleaner closings and faster funding. See <Link href="/resources/how-title-companies-choose-a-signing-service" className="text-violet-600 underline">how to choose a signing service</Link>, or place an order below.</p>
          </section>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link href="/order" className="inline-flex items-center justify-center bg-violet-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-violet-700">Place a Signing Order</Link>
          <Link href="/partners" className="inline-flex items-center justify-center border border-gray-300 px-6 py-3.5 rounded-xl font-bold text-gray-800 hover:bg-gray-50">See How It Works</Link>
        </div>
      </article>
    </MarketingShell>
  )
}
