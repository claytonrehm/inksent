import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import NotaryApplyForm from './NotaryApplyForm'
import { DollarSign, Zap, Clock, Star, Shield, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Join Our Notary Network — Inksent',
  description: 'Apply to join Inksent\'s signing agent network. $75/signing, paid within 7 days, simple one-tap accept.',
}

const PERKS = [
  { icon: <DollarSign size={18} />, title: '$75 per signing', desc: 'Paid per completed signing via Zelle, Venmo, or check. No minimums, no surprises.' },
  { icon: <Zap size={18} />, title: 'One-tap accept', desc: 'Get a text with full job details. One tap to accept — no back and forth, no phone calls.' },
  { icon: <Clock size={18} />, title: 'Flexible schedule', desc: 'Accept only what fits your calendar. No minimums, no penalties for passing.' },
  { icon: <Star size={18} />, title: 'Real relationships', desc: 'We are a small, personal team — not a faceless platform. You deal with a real person every time.' },
]

const REQUIREMENTS = [
  'NNA-certified signing agent',
  'Current background check (within 2 years)',
  'Reliable transportation',
  'Professional appearance',
  'E&O insurance (preferred)',
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
          <h1 className="text-4xl font-black text-gray-900 mb-3">Join Our Signing Network</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Inksent partners with elite NNA-certified signing agents. We send you the jobs — you focus on the closing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — perks + requirements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pay promise */}
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 text-white">
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Per Signing</p>
              <div className="text-5xl font-black mb-1">$75</div>
              <p className="text-violet-200 text-sm">Paid per completed signing</p>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs text-violet-200">
                Zelle, Venmo, or check. No minimum signings required.
              </div>
            </div>

            {/* Perks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-gray-900">What you get</h3>
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
              <h2 className="text-xl font-bold text-gray-900 mb-1">Agent Application</h2>
              <p className="text-sm text-gray-500 mb-6">Takes about 3 minutes. We review every application personally.</p>
              <NotaryApplyForm />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Questions? <a href="mailto:orders@inksent.co" className="underline hover:text-gray-600">orders@inksent.co</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
