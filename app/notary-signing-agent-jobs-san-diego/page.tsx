import Link from 'next/link'
import { Phone, Mail, Smartphone, DollarSign, Landmark, CalendarCheck, MapPin, Languages, ArrowRight, CheckCircle2 } from 'lucide-react'
import InksentLogo from '@/components/InksentLogo'
import JsonLd from '@/components/JsonLd'
import { organizationSchema } from '@/lib/seo'

export const metadata = {
  title: 'Notary Signing Agent Jobs in San Diego — $90/Signing | Inksent',
  description:
    'Notary signing agent jobs in San Diego County. $90 per completed signing, jobs come to you by text, paid automatically to your bank. Free to join, set your own coverage and schedule.',
  alternates: { canonical: '/notary-signing-agent-jobs-san-diego' },
  keywords: [
    'notary signing agent jobs San Diego', 'loan signing agent jobs San Diego', 'mobile notary jobs San Diego',
    'notary jobs San Diego', 'signing agent work San Diego', 'NSA jobs San Diego',
  ],
}

const PERKS = [
  { icon: <DollarSign size={20} />, title: '$90 per completed signing', body: 'Competitive flat pay on every signing. No membership fees — it\'s completely free to join.' },
  { icon: <Smartphone size={20} />, title: 'Jobs come to you by text', body: 'When a signing opens in a ZIP you cover, we text you the details. One tap to accept — first to respond gets it.' },
  { icon: <Landmark size={20} />, title: 'Paid automatically', body: 'Connect your bank once. Your $90 lands by direct deposit after each signing — no invoicing, no chasing your pay.' },
  { icon: <MapPin size={20} />, title: 'You set your coverage', body: 'Tell us your home ZIP and how far you\'ll drive. We match you by real distance — no jobs across the county.' },
  { icon: <CalendarCheck size={20} />, title: 'Total flexibility', body: 'Accept only the jobs that fit your schedule. No minimums, no quotas, no penalty for passing.' },
  { icon: <Languages size={20} />, title: 'Bilingual? More jobs.', body: 'Spanish, Mandarin, Vietnamese, Tagalog, Korean and more — we match you to signings that need your language.' },
]

const REQS = [
  'Current California notary commission',
  'NNA certification (or willingness to obtain)',
  'Recent background check',
  'E&O insurance',
  'Dual-tray laser printer + reliable transportation',
  'A phone that receives texts',
]

export default function Page() {
  return (
    <main className="bg-white text-gray-900">
      <JsonLd data={organizationSchema} />

      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <div className="flex items-center gap-4 text-sm">
            <a href="tel:+16199493361" className="hidden sm:flex items-center gap-1.5 font-semibold text-gray-700"><Phone size={14} /> (619) 949-3361</a>
            <Link href="/apply" className="bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700">Apply Now</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">
        {/* Hero */}
        <section>
          <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">San Diego County · Now hiring</p>
          <h1 className="text-4xl sm:text-5xl font-black leading-[1.08] mb-5">Notary signing agent jobs in San Diego — $90 per signing.</h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Inksent is hiring NNA-certified mobile notary signing agents across San Diego County. Get loan-signing jobs by text in your area, earn $90 per completed signing paid automatically to your bank, and set your own coverage and schedule. Free to join — no membership fees, ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Link href="/apply" className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-violet-700">
              Apply in ~3 minutes <ArrowRight size={17} />
            </Link>
            <a href="tel:+16199493361" className="inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3.5 rounded-xl font-bold text-gray-800 hover:bg-gray-50">
              <Phone size={17} /> (619) 949-3361
            </a>
          </div>
        </section>

        {/* Perks */}
        <section>
          <h2 className="text-2xl font-black mb-6">Why sign with Inksent</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {PERKS.map((p) => (
              <div key={p.title} className="border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">{p.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-black mb-4">How it works</h2>
          <ol className="space-y-3 text-gray-700">
            {['Apply online in about 3 minutes.', 'Once approved, finish a quick profile and connect your bank.', 'We text you signings in your coverage area — tap to accept.', 'Complete the signing, mark it done, and get paid automatically.'].map((s, i) => (
              <li key={i} className="flex gap-3"><span className="shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span><span className="leading-relaxed">{s}</span></li>
            ))}
          </ol>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-2xl font-black mb-4">What you need to join</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {REQS.map((r) => (
              <div key={r} className="flex items-center gap-2 text-gray-700"><CheckCircle2 size={16} className="text-green-500 shrink-0" /><span className="text-sm">{r}</span></div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-2">Ready for more signings?</h2>
          <p className="text-violet-100 mb-5 max-w-xl mx-auto">Join the Inksent network and start getting loan-signing jobs by text in San Diego County.</p>
          <Link href="/apply" className="bg-white text-violet-700 font-bold px-7 py-3 rounded-xl hover:bg-violet-50 inline-block">Apply Now</Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <InksentLogo size="sm" />
          <div className="flex gap-5">
            <Link href="/join" className="hover:text-gray-800">Notary Network</Link>
            <Link href="/partners" className="hover:text-gray-800">For Title Companies</Link>
            <Link href="/faq" className="hover:text-gray-800">FAQ</Link>
            <a href="mailto:support@inksent.co" className="hover:text-gray-800 flex items-center gap-1"><Mail size={12} /> Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
