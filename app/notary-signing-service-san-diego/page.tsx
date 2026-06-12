import Link from 'next/link'
import { Phone, Mail, ShieldCheck, Clock, MapPin, RefreshCw, FileCheck2, CheckCircle2, ArrowRight } from 'lucide-react'
import InksentLogo from '@/components/InksentLogo'
import JsonLd from '@/components/JsonLd'
import { organizationSchema, faqSchema } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { lookupZip } from '@/lib/coverage'
import { credentialsEligible } from '@/lib/credentials'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Notary Signing Service in San Diego — Loan Signing Agents | Inksent',
  description:
    'On-demand notary signing agents for title and escrow companies in San Diego County. NNA-certified, background-checked, E&O-insured agents confirmed in ~30 minutes, flat $185, with automatic backup if anyone cancels.',
  alternates: { canonical: '/notary-signing-service-san-diego' },
  keywords: [
    'notary signing service San Diego', 'mobile notary San Diego', 'loan signing agent San Diego',
    'signing agent service San Diego', 'title company notary San Diego', 'escrow signing service San Diego',
    'refinance signing San Diego', 'purchase signing notary San Diego',
  ],
}

const FAQ: [string, string][] = [
  ['How fast can you get a notary signing agent in San Diego?', 'Most signings are confirmed in about 30 minutes. We alert every qualified agent covering the area at once, and the first to accept is assigned — no phone tag or waiting for callbacks.'],
  ['What does a notary signing typically cost?', 'A flat $185 per signing — no contracts, no minimums, and no surprise trip fees. Pay by card or ACH, with net-30 available for established title and escrow partners.'],
  ['Are your signing agents vetted and insured?', 'Yes. Every agent is NNA-certified, background-checked, and E&O-insured, and we re-verify credentials before every job. An agent with a lapsed credential is automatically blocked from being assigned.'],
  ['What happens if the assigned agent cancels?', 'The job instantly re-offers to every other covering agent until one accepts, and your document package re-routes to whoever takes it — so you never have to scramble or re-send anything.'],
  ['What types of signings do you handle?', 'Purchase, refinance, HELOC, reverse mortgage, loan modification, seller packages, loan applications, and single-document notarizations. Agents are equipped with dual-tray printers for legal + letter packages.'],
  ['Which areas of San Diego do you cover?', 'San Diego County and surrounding areas, including Chula Vista, Carlsbad, El Cajon, Spring Valley, and into Riverside County. Submit an order and we confirm coverage fast.'],
]

const POINTS = [
  { icon: <Clock size={20} />, title: '~30-minute confirmation', body: 'We alert every qualified agent in the area at once — first to accept wins. No phone tag, no waiting hours for a callback.' },
  { icon: <RefreshCw size={20} />, title: 'Automatic backup on cancel', body: 'If your agent cancels, the job instantly re-offers to every other covering agent until one sticks. You never scramble for a replacement.' },
  { icon: <ShieldCheck size={20} />, title: 'Every agent vetted & insured', body: 'NNA-certified, background-checked, and E&O-insured — verified before every job. A lapsed credential auto-blocks the agent from your closing.' },
  { icon: <FileCheck2 size={20} />, title: 'Documents follow the job', body: 'Upload the package once; whoever ends up at the table gets it — even a backup. A lender re-send replaces the old set so no one signs stale docs.' },
  { icon: <MapPin size={20} />, title: 'Live tracking', body: 'Watch real-time status from a link — confirmed with agent photo, on the way, arrived, complete. Keep escrow and borrowers informed.' },
  { icon: <CheckCircle2 size={20} />, title: 'Flat $185, no games', body: 'No contracts, no minimums, no surprise trip fees. Pay by card or ACH, net 30 for established partners.' },
]

export default async function Page() {
  // Real, fresh coverage — pulls the cities currently staffed by credential-eligible
  // agents, so the page shows genuine local content (and never claims coverage we
  // can't staff).
  const supabase = await createClient()
  const { data: bench } = await supabase
    .from('notaries')
    .select('base_zip, nna_certified, nna_cert_expiry, background_checked, bgc_date, eo_carrier, eo_expiry, commission_expiry')
    .eq('active', true)
    .not('onboarded_at', 'is', null)
  const cities = new Set<string>()
  for (const n of bench ?? []) {
    if (!credentialsEligible(n)) continue
    const info = n.base_zip ? lookupZip(n.base_zip) : null
    if (info && info.state === 'CA') cities.add(info.city)
  }
  const coveredCities = Array.from(cities).sort()

  return (
    <main className="bg-white text-gray-900">
      <JsonLd data={[organizationSchema, faqSchema(FAQ)]} />

      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <div className="flex items-center gap-4 text-sm">
            <a href="tel:+16199493361" className="hidden sm:flex items-center gap-1.5 font-semibold text-gray-700"><Phone size={14} /> (619) 949-3361</a>
            <Link href="/order" className="bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700">Place an Order</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">
        {/* Hero */}
        <section>
          <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-3">San Diego County · Loan Signings</p>
          <h1 className="text-4xl sm:text-5xl font-black leading-[1.08] mb-5">Notary signing service in San Diego, done right.</h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Inksent dispatches vetted, NNA-certified mobile notary signing agents for title companies, escrow officers, and lenders across San Diego County — purchase, refinance, HELOC, reverse mortgage, and seller packages. Confirmed in about 30 minutes, with an automatic backup if anyone cancels.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Link href="/order" className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-violet-700">
              Place a Signing Order <ArrowRight size={17} />
            </Link>
            <a href="tel:+16199493361" className="inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3.5 rounded-xl font-bold text-gray-800 hover:bg-gray-50">
              <Phone size={17} /> (619) 949-3361
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-3">No contracts · No minimums · Flat $185 per signing</p>
        </section>

        {/* Why */}
        <section>
          <h2 className="text-2xl font-black mb-6">Why title &amp; escrow teams choose Inksent</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {POINTS.map((p) => (
              <div key={p.title} className="border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">{p.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage */}
        <section>
          <h2 className="text-2xl font-black mb-3">Where we cover — San Diego County &amp; surrounding areas</h2>
          {coveredCities.length > 0 ? (
            <>
              <p className="text-gray-600 mb-4">Active signing agents currently serving:</p>
              <div className="flex flex-wrap gap-2">
                {coveredCities.map((c) => (
                  <span key={c} className="text-sm bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">Don&apos;t see your city? We&apos;re expanding continuously — <Link href="/order" className="text-violet-600 underline">submit an order</Link> and we&apos;ll confirm coverage fast.</p>
            </>
          ) : (
            <p className="text-gray-600">We dispatch across San Diego County and surrounding areas. <Link href="/order" className="text-violet-600 underline">Submit an order</Link> and we&apos;ll confirm coverage fast.</p>
          )}
        </section>

        {/* Signing types */}
        <section>
          <h2 className="text-2xl font-black mb-3">Signings we handle</h2>
          <p className="text-gray-600 mb-4">Purchase · Refinance · HELOC · Reverse Mortgage · Loan Modification · Seller Packages · Loan Applications · Single-document notarizations</p>
          <p className="text-gray-600 leading-relaxed">Every agent is vetted for real loan-signing experience and equipped with a dual-tray printer for legal + letter packages. Bilingual agents (Spanish, Mandarin, Vietnamese, Tagalog, Korean and more) are matched automatically when a signing needs them.</p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black mb-6">San Diego notary signing — FAQ</h2>
          <div className="space-y-5">
            {FAQ.map(([q, a]) => (
              <div key={q} className="border-b border-gray-100 pb-5">
                <h3 className="font-bold text-gray-900 mb-1.5">{q}</h3>
                <p className="text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-2">Need a signing agent in San Diego?</h2>
          <p className="text-violet-100 mb-5 max-w-xl mx-auto">Place an order in two minutes and watch it get confirmed — or call us directly. No account or contract required to start.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/order" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50">Place a Signing Order</Link>
            <a href="tel:+16199493361" className="border border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10">Call (619) 949-3361</a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <InksentLogo size="sm" />
          <div className="flex gap-5">
            <Link href="/partners" className="hover:text-gray-800">For Title Companies</Link>
            <Link href="/join" className="hover:text-gray-800">For Signing Agents</Link>
            <Link href="/faq" className="hover:text-gray-800">FAQ</Link>
            <a href="mailto:support@inksent.co" className="hover:text-gray-800 flex items-center gap-1"><Mail size={12} /> Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
