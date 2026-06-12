export const metadata = {
  title: 'Independent Contractor Agreement — Inksent',
  description: 'The independent-contractor terms for notary signing agents in the Inksent network — payment, responsibilities, and conduct.',
  alternates: { canonical: '/notary-agreement' },
}

export default function NotaryAgreementPage() {
  return (
    <div className="text-gray-700 leading-relaxed space-y-5 text-sm">
      <h1 className="text-3xl font-black text-gray-900">Signing Agent Independent Contractor Agreement</h1>
      <p className="text-gray-400">Last updated: June 2026</p>

      <p>This Independent Contractor Agreement (&ldquo;Agreement&rdquo;) is between Inksent Signing Services (&ldquo;Inksent,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) and the notary signing agent who accepts it (&ldquo;you,&rdquo; &ldquo;Signing Agent&rdquo;). <b>By checking the acceptance box on your application, you agree to this Agreement.</b></p>

      <H>1. Independent contractor relationship</H>
      <p>You are an <b>independent contractor</b>, not an employee, agent, partner, or joint venturer of Inksent. Nothing in this Agreement creates an employment relationship. Specifically:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>You decide <b>whether and when</b> to accept any signing offered to you. You may decline any job and are under no obligation to accept a minimum number.</li>
        <li>You <b>control the manner and means</b> of performing your work, set your own hours, and use your own equipment, supplies, and transportation.</li>
        <li>You are <b>free to perform services for others</b>, including competitors. This is a non-exclusive relationship.</li>
        <li>You are not entitled to employee benefits of any kind.</li>
      </ul>

      <H>2. Taxes &amp; expenses</H>
      <p>You are solely responsible for all federal, state, and local taxes on your earnings, and for all your own business expenses. Inksent will not withhold taxes. Earnings of $600 or more in a calendar year will be reported on a Form 1099-NEC; you must provide valid tax information (e.g., a W-9) before payment.</p>

      <H>3. Your qualifications &amp; representations</H>
      <p>You represent and warrant that, at all times you perform work:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>You hold a <b>valid, current notary commission</b> in the state(s) where you perform signings, and any certifications (e.g., NNA) and background checks you represent to us are accurate and current.</li>
        <li>You carry, or will carry before performing signings, your <b>own Errors &amp; Omissions (E&amp;O) insurance</b> appropriate to signing-agent work.</li>
        <li>All information in your application is truthful and accurate.</li>
        <li>You comply with all laws applicable to your work, including notary and consumer-protection laws.</li>
      </ul>

      <H>4. Performance standards</H>
      <p>Accepting a job is a commitment. You agree to arrive on time, conduct yourself professionally, and complete signings competently. Repeated cancellations, no-shows, lateness, or unprofessional conduct may result in removal from the network.</p>

      <H>5. No legal advice / unauthorized practice of law</H>
      <p>You will <b>not</b> provide legal, financial, or escrow advice, interpret documents beyond identifying them, or engage in the unauthorized practice of law. Your role is limited to properly notarizing and facilitating execution of documents.</p>

      <H>6. Confidentiality &amp; data security</H>
      <p>You will treat all borrower, signer, document, and client information as strictly confidential, use it only to perform the assigned signing, safeguard it against unauthorized access, and return or securely destroy documents as instructed. You will comply with applicable privacy and data-security laws (including those governing non-public personal information in financial transactions).</p>

      <H>7. Compensation</H>
      <p>You are paid the per-signing fee shown when you accept a job, for each properly completed signing, by the payout method you select. Payouts are typically released after the client has paid for the signing. You are not paid for declined or incomplete jobs except as required by law.</p>

      <H>8. Indemnification</H>
      <p>You agree to defend, indemnify, and hold harmless Inksent and its owner, contractors, and affiliates from and against any claims, damages, losses, liabilities, and expenses (including reasonable attorneys&rsquo; fees) arising out of or related to your acts, errors, omissions, professional conduct, breach of this Agreement, or violation of law.</p>

      <H>9. Limitation of liability</H>
      <p>To the fullest extent permitted by law, Inksent&rsquo;s liability to you arising out of this Agreement shall not exceed the fees paid to you for the signing giving rise to the claim, and Inksent shall not be liable for indirect or consequential damages.</p>

      <H>10. Term &amp; termination</H>
      <p>Either party may end this relationship at any time, with or without cause. Sections regarding confidentiality, indemnification, limitation of liability, and taxes survive termination.</p>

      <H>11. Governing law</H>
      <p>This Agreement is governed by the laws of the State of California, without regard to conflict-of-law rules. Disputes will be brought in the state or federal courts located in San Diego County, California.</p>

      <H>12. Entire agreement</H>
      <p>This Agreement, together with our <a href="/terms" className="text-violet-600 underline">Terms of Service</a> and <a href="/privacy" className="text-violet-600 underline">Privacy Policy</a>, is the entire agreement regarding your work as a Signing Agent and supersedes prior understandings.</p>

      <H>Contact</H>
      <p>Questions? Email <a href="mailto:support@inksent.co" className="text-violet-600 underline">support@inksent.co</a> or call (619) 949-3361.</p>

      <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">This is a general agreement and not legal advice. We may update it periodically.</p>
    </div>
  )
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-gray-900 pt-3">{children}</h2>
}
