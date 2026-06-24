import InksentLogo from '@/components/InksentLogo'
import BackLink from '@/components/BackLink'
import SalesApplyForm from './SalesApplyForm'
import { TrendingUp, Repeat, Globe, PhoneCall, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Sales Rep Application — Remote, Residual Commission | Inksent',
  description: 'Apply to sell Inksent\'s notary signing platform to title companies. 100% commission, residual income for the life of every account you land. Work remote.',
  alternates: { canonical: '/sales-apply' },
}

const PERKS = [
  { icon: <Repeat size={18} />, title: 'Residual income', desc: '$15 on every signing your accounts send for 2 years, then ongoing residual after. Your book compounds as you add accounts.' },
  { icon: <TrendingUp size={18} />, title: 'Uncapped + producer bonuses', desc: 'No ceiling, plus a $200 bonus each time an account hits 25 signings.' },
  { icon: <Globe size={18} />, title: '100% remote', desc: 'Work from anywhere in the U.S. — you sell into the San Diego title market by phone and video.' },
  { icon: <PhoneCall size={18} />, title: 'Easy pitch', desc: 'No upfront cost to the title companies you sell — they only pay per signing they send.' },
]

const LOOKING_FOR = [
  'B2B sales / cold-calling experience',
  'Comfortable on the phone with decision-makers',
  'Self-motivated, manages own pipeline',
  'Title / escrow / real estate relationships a big plus',
]

export default function SalesApplyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto"><InksentLogo size="md" /></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <BackLink href="/" label="Back to home" />

        <div className="mt-6 mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" /> Now hiring remote sales reps
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Build a Residual Income Book</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Sell Inksent to title companies and get paid <strong className="text-gray-700">$15 on every signing they send for 2 years, then ongoing residual.</strong> 100% commission, fully remote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 text-white">
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Per Signing</p>
              <div className="text-5xl font-black mb-1">$15</div>
              <p className="text-violet-200 text-sm">for 2 years per account, then ongoing residual</p>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs text-violet-200">+ $200 producer bonus at 25 signings · uncapped</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 space-y-4">
              <h3 className="font-bold text-gray-900">Why this role</h3>
              {PERKS.map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="bg-violet-50 text-violet-600 rounded-lg p-2 shrink-0 h-fit">{icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
              <h3 className="font-bold text-gray-900 mb-3">What we&apos;re looking for</h3>
              <div className="space-y-2">
                {LOOKING_FOR.map(r => (
                  <div key={r} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Sales Rep Application</h2>
              <p className="text-sm text-gray-500 mb-6">Takes about 2 minutes. We review every application personally.</p>
              <SalesApplyForm />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Questions? <a href="mailto:support@inksent.co" className="underline hover:text-gray-600">support@inksent.co</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
