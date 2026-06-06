import { Smartphone, DollarSign, MapPin, Landmark, CalendarCheck, Languages, Phone, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import PrintButton from '../partners/PrintButton'

export const metadata = {
  title: 'Join the Inksent Notary Network — $90/Signing, Jobs by Text',
  description: 'Free to join. Get signing jobs by text in your area, $90 per completed signing, paid automatically to your bank.',
}

const PERKS = [
  {
    icon: <Smartphone size={20} />,
    title: 'Jobs come to you by text',
    body: 'When a signing opens up in your area, we text you the details. One tap to accept — first to respond gets it. No bidding, no portals to refresh all day.',
  },
  {
    icon: <DollarSign size={20} />,
    title: '$90 per completed signing',
    body: 'Straightforward, competitive pay on every signing. No membership fees, ever — it’s completely free to join.',
  },
  {
    icon: <Landmark size={20} />,
    title: 'Paid automatically',
    body: 'Connect your bank once. Your $90 lands automatically after each signing — no invoicing us, no waiting around, no chasing your pay.',
  },
  {
    icon: <MapPin size={20} />,
    title: 'You set your coverage',
    body: 'Just tell us your home ZIP and how far you’ll drive. We match you by real distance — no memorizing ZIP codes, no jobs across town.',
  },
  {
    icon: <CalendarCheck size={20} />,
    title: 'Total flexibility',
    body: 'Accept only the jobs that fit your schedule. No minimums, no quotas, and no penalty for passing on one.',
  },
  {
    icon: <Languages size={20} />,
    title: 'Speak another language? More jobs.',
    body: 'Bilingual agents get matched to signings that need them — Spanish, Mandarin, Vietnamese, Tagalog, Korean and more.',
  },
]

export default function JoinPage() {
  return (
    <main className="bg-white text-gray-900">
      <PrintButton />

      <div className="max-w-3xl mx-auto px-8 py-12 print:py-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
          <div className="text-2xl font-black tracking-tight">
            <span className="text-gray-900">ink</span><span className="text-violet-600">sent</span>
            <span className="block text-[10px] font-semibold tracking-[0.25em] text-gray-400 uppercase mt-0.5">Signing Services</span>
          </div>
          <div className="text-right text-sm text-gray-500">
            <a href="tel:+16199493361" className="flex items-center justify-end gap-1.5 font-semibold text-gray-700"><Phone size={13} /> (619) 949-3361</a>
            <a href="mailto:orders@inksent.co" className="flex items-center justify-end gap-1.5"><Mail size={12} /> orders@inksent.co</a>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10">
          <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Now Hiring Signing Agents</p>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Get signing jobs sent straight to your phone.
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Inksent is building a network of professional notary signing agents. Join free, set your coverage area, and we&rsquo;ll text you signings near you — <strong className="text-gray-800">$90 per completed signing, paid automatically to your bank.</strong>
          </p>
        </div>

        {/* Perks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {PERKS.map((p) => (
            <div key={p.title} className="border border-gray-100 rounded-xl p-5 break-inside-avoid">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="bg-violet-50 text-violet-600 rounded-lg p-2">{p.icon}</span>
                <h3 className="font-bold text-gray-900">{p.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* How to join + requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="sm:col-span-2 bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">How to join</h3>
            <ol className="space-y-3">
              {[
                'Apply in about 2 minutes at inksent.co/apply (have a photo ready).',
                'We review every application personally and reach out within 7 days.',
                'Once approved, complete a quick profile and connect your bank for payouts.',
                'Start receiving signing job texts in your area.',
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
            <div className="text-5xl font-black">$90</div>
            <p className="text-violet-200 text-sm mt-1">paid to your bank</p>
            <p className="text-violet-100 text-xs mt-3 border-t border-white/20 pt-3">Free to join · No minimums</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-10">
          <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide text-gray-500">What you&rsquo;ll need</h3>
          <p className="text-sm text-gray-600">
            A current notary commission · reliable transportation · a phone that receives texts · professional appearance. NNA certification, a current background check, and E&amp;O insurance are strongly preferred. (We&rsquo;ll collect a W-9 before your first job.)
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-100 pt-8 text-center">
          <h2 className="text-2xl font-black mb-2">Ready to get more signings?</h2>
          <p className="text-gray-600 mb-5">It&rsquo;s free, it&rsquo;s fast, and there&rsquo;s no obligation.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/apply" className="no-print inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-violet-700 transition-colors">
              Apply Now <ArrowRight size={16} />
            </Link>
            <span className="text-gray-500 text-sm">or visit <span className="font-semibold text-gray-800">inksent.co/apply</span></span>
          </div>
          <p className="text-xs text-gray-400 mt-6">Inksent Signing Services · orders@inksent.co · (619) 949-3361 · inksent.co</p>
        </div>
      </div>
    </main>
  )
}
