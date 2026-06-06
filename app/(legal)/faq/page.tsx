export const metadata = { title: 'FAQ — Inksent' }

const NOTARY_FAQ = [
  ['How do I get jobs?', 'Once you\'re approved and finish onboarding, we text you whenever a signing opens up in your coverage area. Tap the link to accept — first to respond gets it.'],
  ['How much do I get paid?', '$90 per completed signing, paid by your chosen method (Zelle, Venmo, PayPal, or check) after the signing is confirmed complete.'],
  ['How do I get the documents?', 'When you accept a job, you automatically get a secure link to download the document package once the title company uploads it. Print everything and bring it to the signing.'],
  ['What if I can\'t make a job I accepted?', 'Tap "Can\'t make it" as early as possible. We instantly offer it to other agents. Frequent or last-minute cancellations may remove you from the network.'],
  ['How do I finish a signing?', 'After the appointment, tap "Mark Signing Complete" in your assignment email (and upload scan-backs if required). That triggers your payment.'],
  ['What do I need to join?', 'A current notary commission, reliable transportation, professional appearance, and a phone that receives texts. NNA certification and a background check are strongly preferred. You\'ll provide a W-9 before your first job.'],
]

const CLIENT_FAQ = [
  ['How fast will a notary be confirmed?', 'We blast every qualified agent in the area at once, so most signings are confirmed within about 30 minutes.'],
  ['How do I send the signing documents?', 'Your confirmation email has an "Upload Documents" link. Upload the package anytime it\'s ready — your assigned agent gets it automatically, even if coverage changes.'],
  ['What if the assigned notary cancels?', 'We automatically re-offer the job to other covering agents and re-route your documents to whoever takes it — you never have to re-send anything or scramble for a replacement.'],
  ['Can I track the status?', 'Yes — your confirmation email includes a live tracking link showing real-time status and your assigned agent.'],
  ['How much does it cost?', '$185 flat per signing. No contracts, no minimums, no surprise fees. Payment due within 30 days of a completed signing.'],
  ['Do you cover my area?', 'We dispatch nationwide. Coverage depends on agent availability in a given ZIP — submit an order and we\'ll confirm fast.'],
]

export default function FAQPage() {
  return (
    <div className="text-gray-700 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-sm">Quick answers for signing agents and title companies.</p>
      </div>

      <section>
        <h2 className="text-lg font-bold text-violet-700 mb-3">For Signing Agents</h2>
        <div className="space-y-4">
          {NOTARY_FAQ.map(([q, a]) => (
            <div key={q}>
              <p className="font-semibold text-gray-900 text-sm">{q}</p>
              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-violet-700 mb-3">For Title Companies &amp; Escrow</h2>
        <div className="space-y-4">
          {CLIENT_FAQ.map(([q, a]) => (
            <div key={q}>
              <p className="font-semibold text-gray-900 text-sm">{q}</p>
              <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-violet-50 border border-violet-100 rounded-xl p-5 text-sm">
        <p className="font-semibold text-gray-900">Still have a question?</p>
        <p className="text-gray-600 mt-0.5">Email <a href="mailto:support@inksent.co" className="text-violet-600 underline">support@inksent.co</a> or call/text <a href="tel:+16199493361" className="text-violet-600 underline">(619) 949-3361</a>.</p>
      </section>
    </div>
  )
}
