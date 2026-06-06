export const metadata = { title: 'Terms of Service — Inksent' }

export default function TermsPage() {
  return (
    <div className="text-gray-700 leading-relaxed space-y-5 text-sm">
      <h1 className="text-3xl font-black text-gray-900">Terms of Service</h1>
      <p className="text-gray-400">Last updated: June 2026</p>

      <p>These terms govern your use of Inksent Signing Services (&ldquo;Inksent&rdquo;). By placing an order, submitting an application, or using our website, you agree to these terms.</p>

      <H>Our service</H>
      <p>Inksent coordinates notary signing-agent services by matching independent signing agents to signing appointments requested by clients (title companies, escrow officers, and lenders). Inksent is a dispatch and coordination service.</p>

      <H>For clients</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>Our flat fee is $185 per signing unless otherwise agreed in writing.</li>
        <li>Payment is due within 30 days of a completed signing.</li>
        <li>You are responsible for providing accurate signing details and documents.</li>
        <li>We aim to confirm a signing agent quickly but do not guarantee availability in every location at every time.</li>
      </ul>

      <H>For signing agents</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>Signing agents are <b>independent contractors</b>, not employees of Inksent. You are responsible for your own taxes, transportation, supplies, and insurance.</li>
        <li>You must maintain a valid notary commission and any certifications and insurance you represent to us.</li>
        <li>Compensation is per completed signing, paid by the method you select. Earnings of $600 or more in a calendar year are reported on a Form 1099-NEC; a completed W-9 is required before payment.</li>
        <li>Accepting a job is a commitment. Repeated cancellations, no-shows, lateness, or unprofessional conduct may result in removal from the network.</li>
      </ul>

      <H>Independent professional responsibility</H>
      <p>Signing agents are solely responsible for performing notarizations in compliance with the laws of the state in which they are commissioned. Inksent does not provide legal advice and is not responsible for the independent professional conduct of signing agents.</p>

      <H>Limitation of liability</H>
      <p>To the fullest extent permitted by law, Inksent&rsquo;s liability arising from the service is limited to the fees paid for the signing at issue. We are not liable for indirect or consequential damages.</p>

      <H>Changes</H>
      <p>We may update these terms. Continued use of the service after changes constitutes acceptance.</p>

      <H>Contact</H>
      <p>Questions? Email <a href="mailto:support@inksent.co" className="text-violet-600 underline">support@inksent.co</a> or call (619) 949-3361.</p>

      <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">These terms are provided as a general agreement and may be updated. Please review periodically.</p>
    </div>
  )
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-gray-900 pt-3">{children}</h2>
}
