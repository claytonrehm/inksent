import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import NotaryApplyForm from './NotaryApplyForm'
import { DollarSign, Zap, Clock, Star, Shield, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Join Our Notary Network — Inksent',
  description: 'Join Inksent\'s approved notary network. $90 per completed signing, job offers by text.',
}

const HOW_IT_WORKS = [
  { icon: <DollarSign size={18} />, title: '$90 per signing', desc: 'Paid straight to your bank after each completed signing. No minimums, no membership fees.' },
  { icon: <Zap size={18} />, title: 'Jobs come by text', desc: 'When a signing opens up in a ZIP code you cover, we text you the details. Tap to accept — first to respond gets it.' },
  { icon: <Clock size={18} />, title: 'You stay in control', desc: 'Only accept the jobs that fit your schedule. No penalty for passing on one.' },
  { icon: <Star size={18} />, title: 'A real person', desc: 'We\'re a small, local team — not a faceless platform. You always reach an actual person.' },
]

const REQUIREMENTS = [
  'Commissioned notary public',
  'Reliable transportation',
  'Professional appearance',
  'A phone that receives text messages',
]

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <InksentLogo size="md" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-violet-600 hover:underline font-medium">← Back to home</Link>

        {/* Hero */}
        <div className="mt-6 mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            Now accepting applications
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Join Our Notary Network</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Get added to our approved notary list and start receiving signing jobs by text in the areas you cover. <strong className="text-gray-700">$90 per completed signing.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — perks + requirements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pay promise */}
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 text-white">
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Per Signing</p>
              <div className="text-5xl font-black mb-1">$90</div>
              <p className="text-violet-200 text-sm">paid to your bank</p>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs text-violet-200">
                Free to join · No minimums
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-gray-900">How it works</h3>
              {HOW_IT_WORKS.map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="bg-violet-50 text-violet-600 rounded-lg p-2 shrink-0 h-fit">{icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Shield size={15} className="text-violet-600" /> Requirements</h3>
              <div className="space-y-2">
                {REQUIREMENTS.map(r => (
                  <div key={r} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Notary Application</h2>
              <p className="text-sm text-gray-500 mb-6">Takes about 1 minute. We review every application personally.</p>
              <NotaryApplyForm />
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
