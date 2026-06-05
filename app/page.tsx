import Link from 'next/link'
import { CheckCircle, Clock, DollarSign, MapPin, Phone, Shield, ArrowRight } from 'lucide-react'
import InksentLogo from '@/components/InksentLogo'
import HeroStats from '@/components/HeroStats'
import StatesGrid from '@/components/StatesGrid'
import ScrollReveal from '@/components/ScrollReveal'
import NavClient from '@/components/NavClient'

const HOW_IT_WORKS = [
  { step: '01', title: 'Submit Your Order', desc: 'Fill out our simple online form with property address, signing date, and borrower info. Takes under 2 minutes.', icon: '📋' },
  { step: '02', title: 'We Dispatch a Notary', desc: 'We assign a vetted, NNA-certified signing agent in your area and confirm coverage within 30 minutes.', icon: '📡' },
  { step: '03', title: 'Signing Completed', desc: 'Your signing agent shows up on time, executes the documents, and you receive confirmation when it\'s done.', icon: '✅' },
]

const FEATURES = [
  { icon: <Clock size={22} />, title: '30-Min Confirmation', desc: 'We confirm notary assignment faster than anyone else in the industry.' },
  { icon: <Shield size={22} />, title: 'NNA Certified Agents', desc: 'Every signing agent is background-checked, insured, and NNA certified.' },
  { icon: <DollarSign size={22} />, title: 'Flat-Rate Pricing', desc: 'No surprise fees. Simple, transparent pricing on every single signing.' },
  { icon: <MapPin size={22} />, title: '27-State Coverage', desc: 'All non-attorney states covered. One vendor relationship, anywhere you close.' },
]

const SIGNING_TYPES = [
  { label: 'Purchase', emoji: '🏠' },
  { label: 'Refinance', emoji: '💰' },
  { label: 'HELOC', emoji: '🏦' },
  { label: 'Reverse Mortgage', emoji: '📊' },
  { label: 'Loan Modification', emoji: '📝' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav — client component handles scroll-based transparency */}
      <NavClient />

      {/* Hero — light with violet accents */}
      <section className="relative overflow-hidden bg-white pt-10 pb-0">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-8 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
              Available in 27 Non-Attorney States
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.05] mb-5 tracking-tight">
              Signing Agents,{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                  On Demand
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 Q75 2 150 8 Q225 14 298 6" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
                </svg>
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              Inksent connects title companies, escrow officers, and lenders with vetted NNA-certified signing agents — anywhere, anytime.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <Link
                href="/order"
                className="group inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-6 sm:px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Place a Signing Order
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+16199493361"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-6 sm:px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:border-violet-300 hover:text-violet-700 transition-all w-full sm:w-auto"
              >
                <Phone size={18} />
                (619) 949-3361
              </a>
            </div>
            <p className="text-gray-400 text-sm">No contracts · No minimums · 30-min confirmation</p>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={400}>
            <div className="mt-16 border-t border-gray-100 pt-10">
              <HeroStats />
            </div>
          </ScrollReveal>
        </div>

        {/* Signing type pill strip */}
        <ScrollReveal delay={500}>
          <div className="pb-16 px-6 mt-4">
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {SIGNING_TYPES.map(({ label, emoji }) => (
                <span key={label} className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 transition-colors cursor-default">
                  <span>{emoji}</span> {label}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Trust bar */}
      <div className="bg-gray-900 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-gray-300 text-sm font-medium">
          {['NNA Certified Network', 'Background Checked', 'Flat-Rate Pricing', '27 States'].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-violet-400" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl font-black text-gray-900">How It Works</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-gradient-to-r from-violet-100 via-violet-300 to-violet-100" />
            {HOW_IT_WORKS.map(({ step, title, desc, icon }, i) => (
              <ScrollReveal key={step} delay={i * 120}>
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group h-full">
                  <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:bg-violet-100 transition-colors">
                    {icon}
                  </div>
                  <div className="absolute top-6 right-7 text-3xl font-black text-gray-100">{step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Our Commitment</p>
            <h2 className="text-4xl font-black text-gray-900">Why Inksent</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={i * 80}>
                <div className="flex items-start gap-5 p-7 rounded-2xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 group cursor-default h-full">
                  <div className="bg-violet-50 text-violet-600 rounded-2xl p-3 shrink-0 group-hover:bg-violet-100 group-hover:scale-110 transition-all">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5 text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Pricing</p>
            <h2 className="text-4xl font-black text-gray-900">One flat rate. No surprises.</h2>
            <p className="text-gray-500 mt-3 text-lg">No contracts, no minimums, no hidden fees.</p>
          </ScrollReveal>
          <ScrollReveal>
            <div className="max-w-sm mx-auto bg-white border-2 border-violet-200 rounded-3xl p-8 shadow-xl shadow-violet-100 text-center">
              <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-4">Per Signing</p>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-gray-400">$</span>
                <span className="text-7xl font-black text-gray-900 leading-none">150</span>
              </div>
              <p className="text-gray-500 text-sm mb-8">flat rate, any signing type</p>
              <div className="space-y-3 text-left mb-8">
                {[
                  'All signing types — purchase, refi, HELOC, and more',
                  'NNA-certified, background-checked agent',
                  'Notary assignment confirmed within 30 minutes',
                  'Invoice emailed after each completed signing',
                  'Coverage in all 27 non-attorney states',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-violet-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/order" className="block w-full bg-violet-600 text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-violet-700 transition-colors">
                Place an Order
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* States */}
      <section id="coverage" className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-10">
            <p className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">Coverage</p>
            <h2 className="text-4xl font-black text-gray-900 mb-3">27 Non-Attorney States</h2>
            <p className="text-gray-500">Tap any state to see full name</p>
          </ScrollReveal>
          <StatesGrid />
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-28 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-5 leading-tight">
              Ready to close{' '}
              <span className="text-violet-600">faster?</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10">No contracts. No minimums. Reliable signings, confirmed in 30 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="group inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 hover:-translate-y-0.5">
                Place an Order Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="mailto:orders@inksent.co" className="inline-flex items-center justify-center border-2 border-gray-200 text-gray-700 px-10 py-4 rounded-xl font-bold text-lg hover:border-violet-300 hover:text-violet-700 transition-all">
                Email Us
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer — dark to hold logo */}
      <footer className="bg-black px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <InksentLogo size="md" dark />
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500">
              <a href="tel:+16199493361" className="hover:text-gray-300 transition-colors flex items-center gap-1.5"><Phone size={13} />(619) 949-3361</a>
              <span className="hidden sm:block">·</span>
              <a href="mailto:orders@inksent.co" className="hover:text-gray-300 transition-colors">orders@inksent.co</a>
              <span className="hidden sm:block">·</span>
              <Link href="/apply" className="hover:text-gray-300 transition-colors">Join our network</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} Inksent Signing Services · All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}
