export const metadata = {
  title: 'Privacy Policy — Inksent',
  description: 'How Inksent collects, uses, and protects the information of title companies, signing agents, and signers who use our notary signing service.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="text-gray-700 leading-relaxed space-y-5 text-sm">
      <h1 className="text-3xl font-black text-gray-900">Privacy Policy</h1>
      <p className="text-gray-400">Last updated: June 2026</p>

      <p>Inksent Signing Services (&ldquo;Inksent,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) provides notary signing-agent dispatch services. This policy explains what information we collect, how we use it, and your choices.</p>

      <H>Information we collect</H>
      <p><b>From clients (title companies, escrow, lenders):</b> company name, contact name, email, phone, and the signing details you submit (property address, signer name and contact, signing date/time).</p>
      <p><b>From signing agents who apply:</b> name, email, phone, photo, coverage area, experience, certification and background-check status, and—after approval—commission and E&amp;O insurance details and payment information.</p>
      <p><b>Automatically:</b> basic usage and device data when you use our website.</p>

      <H>How we use information</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>To match signing agents to orders and coordinate signings</li>
        <li>To contact you about orders, applications, and assignments by email, phone, and SMS</li>
        <li>To process payments to signing agents and invoices to clients</li>
        <li>To operate, secure, and improve our services</li>
      </ul>

      <H>SMS / text messaging</H>
      <p>If you provide a mobile number, you consent to receive SMS messages from Inksent related to signing jobs, assignments, confirmations, and account notices. Message frequency varies. Message and data rates may apply. Reply <b>STOP</b> to opt out at any time, or <b>HELP</b> for help. Opting out of SMS may limit our ability to offer you signing jobs. <b>We do not share your mobile phone number or SMS opt-in consent with third parties or affiliates for their marketing or promotional purposes</b>; we share it only with the providers that help us deliver these messages (such as Twilio).</p>

      <H>How we share information</H>
      <p>We share information only as needed to run the service: signing details are shared with the assigned signing agent; agent contact details are shared with the relevant client; and we use trusted service providers (including Twilio for SMS, Resend for email, Supabase for data storage, and Vercel for hosting). We do not sell your personal information.</p>

      <H>Data retention &amp; security</H>
      <p>We keep information for as long as needed to provide the service and meet legal and tax obligations, then delete or anonymize it. We use reasonable safeguards to protect your data. Sensitive tax documents (such as W-9 forms) are collected by email and handled separately from our application database.</p>

      <H>Financial information (Gramm-Leach-Bliley)</H>
      <p>In the course of coordinating loan and real-estate signings, we may handle <b>nonpublic personal information (NPI)</b> about borrowers and signers. We collect and use this information solely to facilitate the requested signing, limit access to those who need it to perform the service, require our signing agents to keep it confidential and return or destroy documents as instructed, and maintain administrative, technical, and physical safeguards to protect it. We do not use borrower NPI for marketing and we do not sell it.</p>

      <H>Data security &amp; breach notification</H>
      <p>We use industry-standard safeguards including encryption in transit, access controls, private document storage with time-limited access links, and restricted administrative access. No system is perfectly secure, but in the event of a data breach affecting your personal information, we will notify affected parties and authorities as required by applicable law.</p>

      <H>California privacy rights (CCPA/CPRA)</H>
      <p>If you are a California resident, you have the right to know what personal information we collect, to request access or deletion, and to not be discriminated against for exercising these rights. <b>We do not sell or share your personal information</b> for cross-context behavioral advertising. To exercise your rights, email <a href="mailto:support@inksent.co" className="text-violet-600 underline">support@inksent.co</a>.</p>

      <H>Your choices</H>
      <p>You may request access to, correction of, or deletion of your information by emailing <a href="mailto:support@inksent.co" className="text-violet-600 underline">support@inksent.co</a>. You can opt out of SMS by replying STOP.</p>

      <H>Contact</H>
      <p>Questions? Email <a href="mailto:support@inksent.co" className="text-violet-600 underline">support@inksent.co</a> or call (619) 949-3361.</p>

      <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">This policy is provided for transparency and may be updated. Please review periodically.</p>
    </div>
  )
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-gray-900 pt-3">{children}</h2>
}
