import InksentLogo from '@/components/InksentLogo'
import BackLink from '@/components/BackLink'
import PartnerApplyForm from './PartnerApplyForm'
import CoverageCheck from '@/components/CoverageCheck'
import { CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Become a Title Partner — Inksent',
  description: 'Set up your title or escrow company with Inksent: vetted, insured notary signing agents, 30-minute confirmation, live tracking, from $200 per signing, and white-glove service.',
  alternates: { canonical: '/partners/apply' },
}

const PERKS = [
  'Vetted, NNA-certified, E&O-insured agents — credentials monitored automatically',
  'From $200 per signing ($250 purchases) — no surprises',
  'Confirmed within ~30 minutes, automatic backup if an agent cancels',
  'Live tracking + proactive status updates, so you never have to chase',
  'Per-signing or monthly net-30 billing — your call',
]

export default function PartnerApplyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto"><InksentLogo size="md" /></div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <BackLink href="/partners" label="Back" />
        <div className="mt-6 mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Become a partner</h1>
          <p className="text-gray-500 text-lg max-w-2xl">Tell us a bit about your title company and we&apos;ll get you set up — usually within one business day.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-3">
              {PERKS.map((p) => (
                <div key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-violet-600 shrink-0 mt-0.5" /> {p}
                </div>
              ))}
            </div>
            <CoverageCheck />
          </div>
          <div className="lg:col-span-3"><PartnerApplyForm /></div>
        </div>
      </div>
    </main>
  )
}
