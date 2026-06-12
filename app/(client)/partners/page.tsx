import { ShieldCheck, FileCheck2, MapPin, Clock, Eye, DollarSign, Phone, Mail, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import PrintButton from './PrintButton'
import JsonLd from '@/components/JsonLd'
import { organizationSchema } from '@/lib/seo'

export const metadata = {
  title: 'Notary Signing Service for Title & Escrow Companies | Inksent',
  description: 'A faster, more reliable notary signing service for title and escrow: vetted NNA-certified agents, 30-minute confirmation, automatic backup on cancel, live tracking, from $200 per signing.',
  alternates: { canonical: '/partners' },
  keywords: ['notary signing service', 'title company notary', 'escrow signing service', 'loan signing service', 'signing agent dispatch'],
}

const EDGES = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'Never left scrambling',
    body: 'If your assigned notary cancels, the job instantly re-offers to every other covering agent — automatically — until one sticks. You hear about the replacement, not the problem.',
  },
  {
    icon: <FileCheck2 size={20} />,
    title: 'Documents follow the job',
    body: 'Upload your package once. Whoever ends up at the table gets it automatically — even a last-minute backup. And when the lender sends an update, the old package is deleted and the agent re-notified — no one ever signs a stale set.',
  },
  {
    icon: <Eye size={20} />,
    title: 'You know who shows up',
    body: 'Every agent is NNA-certified, background-checked, E&O-insured, photographed, and vetted for real purchase & refi experience. Anyone whose credentials lapse is automatically blocked from your closing — never a stranger, never a rookie.',
  },
  {
    icon: <Clock size={20} />,
    title: 'Confirmed in ~30 minutes',
    body: 'We alert every qualified agent in the area at once; first to accept wins. No phone tag, no waiting hours to learn if you’re covered.',
  },
  {
    icon: <MapPin size={20} />,
    title: 'Live tracking + borrower heads-up',
    body: 'Watch real-time status from a link — confirmed (with agent photo), on the way, arrived, complete. Your borrower even gets a text on who’s coming and when.',
  },
  {
    icon: <Lock size={20} />,
    title: 'Bank-grade data handling',
    body: 'Borrower documents are encrypted, access-controlled, and automatically purged after closing (GLBA/CCPA-aligned). Their non-public information never lingers as a liability on anyone’s laptop.',
  },
  {
    icon: <DollarSign size={20} />,
    title: '$200 refi · $250 purchase. No games.',
    body: 'No contracts, no minimums, no surprise fees. Pay securely online by card or bank transfer (ACH) via Stripe, net-30 — established partners can arrange volume rates and other methods. Bilingual agents matched on request.',
  },
]

export default function PartnersPage() {
  return (
    <main className="bg-white text-gray-900">
      <PrintButton />

      <JsonLd data={organizationSchema} />
      <div className="max-w-3xl mx-auto px-8 py-12 print:py-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
          <Link href="/" className="text-2xl font-black tracking-tight">
            <span className="text-gray-900">ink</span><span className="text-violet-600">sent</span>
            <span className="block text-[10px] font-semibold tracking-[0.25em] text-gray-400 uppercase mt-0.5">Signing Services</span>
          </Link>
          <div className="text-right text-sm text-gray-500">
            <a href="tel:+16199493361" className="flex items-center justify-end gap-1.5 font-semibold text-gray-700"><Phone size={13} /> (619) 949-3361</a>
            <a href="mailto:support@inksent.co" className="flex items-center justify-end gap-1.5"><Mail size={12} /> support@inksent.co</a>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">For Title Companies, Escrow &amp; Lenders</p>
          <h1 className="text-4xl font-black leading-tight mb-4">
            The signing service that doesn&rsquo;t leave you scrambling.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Vetted, on-demand notary signing agents — confirmed in about 30 minutes, with an automatic backup if anyone cancels and documents that follow the job. The reliability of a big platform with the responsiveness of a real person.
          </p>
        </div>

        {/* Edges grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {EDGES.map((e) => (
            <div key={e.title} className="border border-gray-100 rounded-xl p-5 break-inside-avoid shadow-sm hover:shadow-md transition-shadow print:shadow-none">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="bg-violet-50 text-violet-600 rounded-lg p-2">{e.icon}</span>
                <h3 className="font-bold text-gray-900">{e.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{e.body}</p>
            </div>
          ))}
        </div>

        {/* Founder credibility — the differentiator vs. faceless platforms */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-10 break-inside-avoid">
          <p className="text-violet-600 font-semibold text-xs uppercase tracking-widest mb-2">Built by a mortgage insider</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Inksent was founded by <b>Clayton Rehm</b>, an active mortgage loan officer with <b>$200M+ in personal production</b> and working relationships with title companies and nationwide lenders. He&rsquo;s sat on your side of the closing table — and built the signing service he always wished existed: one that treats a clean, on-time closing like it matters, because he knows exactly what&rsquo;s riding on it. When you call, you reach someone who lives this work, not a ticket queue.
          </p>
        </div>

        {/* How it works + pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="sm:col-span-2 bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">How it works</h3>
            <ol className="space-y-3">
              {[
                'Submit your signing in under 2 minutes — or call us.',
                'We confirm a vetted agent in ~30 minutes and send you their details.',
                'Upload your documents once; they route to the agent automatically.',
                'Track it live; invoice arrives after completion.',
              ].map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl p-6 text-white text-center flex flex-col justify-center">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Per Signing</p>
            <div className="text-5xl font-black">$200</div>
            <p className="text-violet-200 text-sm mt-1">refi · $250 purchase</p>
            <p className="text-violet-100 text-xs mt-3 border-t border-white/20 pt-3">No contracts · No minimums · Volume rates available</p>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-100 pt-8 text-center">
          <h2 className="text-2xl font-black mb-2">Try us on one signing.</h2>
          <p className="text-gray-600 mb-5">Zero risk, no commitment. See the difference on your next closing.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/order" className="no-print inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-violet-700 transition-colors">
              Place a Signing Order <ArrowRight size={16} />
            </Link>
            <Link href="/partners/apply" className="no-print inline-flex items-center gap-2 border border-violet-200 text-violet-700 font-bold px-7 py-3.5 rounded-xl hover:bg-violet-50 transition-colors">
              Become a Partner
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-3">or call <a href="tel:+16199493361" className="font-semibold text-gray-800">(619) 949-3361</a></p>
          <p className="text-xs text-gray-400 mt-6">Inksent Signing Services · support@inksent.co · (619) 949-3361 · inksent.co</p>
        </div>
      </div>
    </main>
  )
}
