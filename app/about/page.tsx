import Link from 'next/link'
import { ShieldCheck, Clock, FileCheck2, MapPin, Phone, ArrowRight } from 'lucide-react'
import MarketingShell from '@/components/MarketingShell'
import JsonLd from '@/components/JsonLd'
import { organizationSchema } from '@/lib/seo'

export const metadata = {
  title: 'About Inksent — The Notary Signing Service Built by a Mortgage Insider',
  description:
    'Inksent is an on-demand notary signing service for title, escrow, and lenders, founded by an active mortgage loan officer with $200M+ in production. Vetted agents, 30-minute confirmation, automatic backup, live tracking.',
  alternates: { canonical: '/about' },
  keywords: ['about Inksent', 'notary signing service', 'loan signing company', 'title company notary service', 'San Diego signing service'],
}

const VALUES = [
  { icon: <ShieldCheck size={20} />, title: 'Vetted, insured, verified', body: 'Every agent is NNA-certified, background-checked, and E&O-insured — and we re-check those credentials before every job. A lapsed credential auto-removes an agent from dispatch, so an uninsured notary can never reach your closing.' },
  { icon: <Clock size={20} />, title: 'Confirmed in ~30 minutes', body: 'We alert every qualified agent in the area at once; first to accept wins. No phone tag, no waiting hours to learn if you have coverage.' },
  { icon: <FileCheck2 size={20} />, title: 'Reliability when it counts', body: 'If your agent cancels, the job instantly re-offers to every other covering agent — automatically — and your documents follow the job to whoever takes it. You hear about the replacement, not the problem.' },
  { icon: <MapPin size={20} />, title: 'A real person, not a queue', body: 'When you call, you reach someone who lives this work and treats a clean, on-time closing like it matters — because he knows exactly what is riding on it.' },
]

export default function AboutPage() {
  return (
    <MarketingShell cta={{ href: '/partners', label: 'For Title Companies' }}>
      <JsonLd data={organizationSchema} />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">About Inksent</p>
        <h1 className="text-4xl font-black leading-tight mb-5 text-gray-900">
          The signing service built by someone who&rsquo;s sat at your side of the table.
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          Inksent is an on-demand notary signing service for title companies, escrow officers, and lenders.
          We connect you with vetted, NNA-certified signing agents — typically confirmed in about 30 minutes,
          with an automatic backup if anyone cancels and documents that follow the job to whoever ends up at the table.
        </p>

        {/* Founder */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 mx-auto sm:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/clayton.png" alt="Clayton Rehm, Founder of Inksent"
                className="rounded-2xl object-cover border border-gray-200" style={{ width: 132, height: 132 }} />
              <div className="mt-3 text-center sm:text-left">
                <div className="font-bold text-gray-900">Clayton Rehm</div>
                <div className="text-xs text-gray-500">Founder · Mortgage Loan Officer</div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-3">Why we built this</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Inksent was founded by Clayton Rehm, a San Diego&ndash;born active mortgage loan officer with
                <b> $200M+ in personal production</b> and working relationships with title companies and nationwide lenders.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                After watching too many closings get derailed by a late notary, a no-show, or a last-minute scramble for
                coverage, he built the signing service he always wished existed — one that treats a clean, on-time closing
                like it matters. Inksent isn&rsquo;t a faceless platform; it&rsquo;s built and run by someone who knows
                exactly what a clean closing is worth.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-black text-gray-900 mb-5">What we stand for</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {VALUES.map((v) => (
            <div key={v.title} className="border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="bg-violet-50 text-violet-600 rounded-lg p-2">{v.icon}</span>
                <h3 className="font-bold text-gray-900">{v.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>

        {/* Coverage / honesty */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Where we operate</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            We&rsquo;re headquartered in San Diego and dispatch signing agents nationwide. Coverage in any given area
            depends on agent availability — submit an order or check coverage and we&rsquo;ll confirm fast. If we&rsquo;re
            not yet in your area, tell us and we&rsquo;ll prioritize building it.
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-100 pt-8 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Try us on one signing.</h2>
          <p className="text-gray-600 mb-5">Zero risk, no commitment. See the difference on your next closing.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/order" className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-violet-700 transition-colors">
              Place a Signing Order <ArrowRight size={16} />
            </Link>
            <Link href="/demo" className="inline-flex items-center gap-2 border border-violet-200 text-violet-700 font-bold px-7 py-3.5 rounded-xl hover:bg-violet-50 transition-colors">
              See a Live Demo
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-3">or call <a href="tel:+16199493361" className="font-semibold text-gray-800 inline-flex items-center gap-1"><Phone size={12} /> (619) 949-3361</a></p>
        </div>
      </article>
    </MarketingShell>
  )
}
