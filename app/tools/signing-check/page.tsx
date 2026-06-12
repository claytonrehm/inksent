import { ShieldCheck, AlertTriangle, ListChecks, Stamp, Lock } from 'lucide-react'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { organizationSchema } from '@/lib/seo'
import CheckForm from './CheckForm'

export const metadata = {
  title: 'Free Signing-Package Check — Never Get Kicked Back | Inksent',
  description:
    'Upload a loan-signing package and AI maps every signature, initial, date, and notarization — and flags anything that could get it kicked back. Free for notary signing agents and title companies.',
  alternates: { canonical: '/tools/signing-check' },
  keywords: ['notary signing checklist', 'loan signing document check', 'signing package review', 'notary kicked back', 'signature audit loan documents'],
}

const POINTS = [
  { icon: <ListChecks size={20} />, title: 'Every sign-here spot, mapped', body: 'A page-by-page list of every signature, initial, and date — for every signer. Walk in knowing exactly where to go.' },
  { icon: <Stamp size={20} />, title: 'Exact notarization count', body: 'Know precisely how many acknowledgments and jurats you need — for your journal and your time.' },
  { icon: <AlertTriangle size={20} />, title: 'Catch kickbacks before the table', body: 'Blank required fields, missing or wrong dates, missing pages, name mismatches, rescission dates — flagged before you ever drive out.' },
  { icon: <Lock size={20} />, title: 'Private by design', body: 'We analyze your PDF in the moment and never store it. Built for the sensitivity of loan documents.' },
]

export default function SigningCheckPage() {
  return (
    <MarketingShell cta={{ href: '/partners', label: 'For Title Companies' }}>
      <JsonLd data={organizationSchema} />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">Free tool · For notaries &amp; title companies</p>
        <h1 className="text-4xl sm:text-5xl font-black leading-[1.08] mb-5">Never get a signing package kicked back again.</h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Upload a loan-signing package and our AI maps <strong>every</strong> place a signer must sign, initial, date, or notarize — and flags anything that could get it rejected by the lender or title company. A missed signature means a redraw, a re-drive, and a lost fee. This catches it first.
        </p>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 sm:p-8 mb-12">
          <CheckForm />
        </div>

        <h2 className="text-2xl font-black mb-6">What you get</h2>
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {POINTS.map((p) => (
            <div key={p.title} className="border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">{p.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-7 text-white">
          <div className="flex items-center gap-2 mb-2"><ShieldCheck size={18} /><h2 className="text-xl font-black">Title companies: QC every signing automatically</h2></div>
          <p className="text-violet-100 leading-relaxed mb-4">Run every package through SignCheck before it goes out, or have your assigned Inksent agent do it — and your closings come back clean the first time, so loans fund faster. Ask us about volume access for your team.</p>
          <a href="mailto:support@inksent.co?subject=SignCheck%20for%20our%20team" className="inline-block bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50">Talk to us</a>
        </div>
      </div>
    </MarketingShell>
  )
}
