import Link from 'next/link'
import { CheckCircle, Clock, DollarSign, MapPin, Phone, Shield, ArrowRight, ShieldCheck, FileCheck2, Eye, Building2, UserRoundCheck, Car, Receipt, LayoutDashboard, Wallet } from 'lucide-react'
import InksentLogo from '@/components/InksentLogo'
import HeroStats from '@/components/HeroStats'
import PhoneMockup from '@/components/PhoneMockup'
import ProcessShowcase from '@/components/ProcessShowcase'
import USMap from '@/components/USMap'
import ScrollReveal from '@/components/ScrollReveal'
import AuroraBackground from '@/components/AuroraBackground'
import NavClient from '@/components/NavClient'
import JsonLd from '@/components/JsonLd'
import { organizationSchema, websiteSchema } from '@/lib/seo'

export const metadata = {
  title: 'Inksent — On-Demand Notary Signing Agents for Title & Escrow',
  description:
    'Order vetted, NNA-certified, background-checked, E&O-insured notary signing agents on demand. Confirmed in ~30 minutes with automatic backup if anyone cancels. Serving San Diego and expanding nationwide.',
  alternates: { canonical: '/' },
  keywords: [
    'notary signing agent', 'mobile notary', 'loan signing agent', 'notary signing service',
    'title company notary', 'escrow signing service', 'San Diego notary signing agent',
    'NNA certified notary', 'order a notary signing',
  ],
}

const FEATURES = [
  { icon: <ShieldCheck size={22} />, title: 'Never Left Scrambling', desc: 'If your notary cancels, the job instantly re-offers to every other covering agent — automatically — until one sticks.' },
  { icon: <FileCheck2 size={22} />, title: 'Documents Follow the Job', desc: 'Upload once; whoever ends up at the table gets it — even a backup. Lender sends an update? The old package is deleted, so no one signs a stale set.' },
  { icon: <Eye size={22} />, title: 'You Know Who Shows Up', desc: 'NNA-certified, background-checked, E&O-insured, and vetted for real purchase & refi experience. Lapsed credentials are auto-blocked from your closing.' },
  { icon: <Clock size={22} />, title: '~30-Minute Confirmation', desc: 'We alert every qualified agent at once; first to accept wins. Typically confirmed in about half an hour — no phone tag, no waiting hours.' },
  { icon: <MapPin size={22} />, title: 'Live Tracking', desc: 'Watch real-time status from a link — confirmed with agent photo, on the way, arrived, complete.' },
  { icon: <DollarSign size={22} />, title: 'Transparent Pricing', desc: 'Set per-signing price, no contracts, no minimums, no surprise fees. Pay online in one click or by check.' },
]

// Cohesive accent spectrum (indigo → violet → fuchsia → sky → pink) so the
// feature grid feels colorful and alive, not just one purple.
const ACCENTS = [
  { ring: 'hover:border-indigo-400/50', glow: 'hover:shadow-[0_18px_50px_-12px_rgba(99,102,241,0.45)]', icon: 'bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-500/25' },
  { ring: 'hover:border-violet-400/50', glow: 'hover:shadow-[0_18px_50px_-12px_rgba(139,92,246,0.45)]', icon: 'bg-violet-500/15 text-violet-300 group-hover:bg-violet-500/25' },
  { ring: 'hover:border-fuchsia-400/50', glow: 'hover:shadow-[0_18px_50px_-12px_rgba(217,70,239,0.45)]', icon: 'bg-fuchsia-500/15 text-fuchsia-300 group-hover:bg-fuchsia-500/25' },
  { ring: 'hover:border-sky-400/50', glow: 'hover:shadow-[0_18px_50px_-12px_rgba(56,189,248,0.40)]', icon: 'bg-sky-500/15 text-sky-300 group-hover:bg-sky-500/25' },
  { ring: 'hover:border-pink-400/50', glow: 'hover:shadow-[0_18px_50px_-12px_rgba(236,72,153,0.45)]', icon: 'bg-pink-500/15 text-pink-300 group-hover:bg-pink-500/25' },
  { ring: 'hover:border-violet-400/50', glow: 'hover:shadow-[0_18px_50px_-12px_rgba(139,92,246,0.45)]', icon: 'bg-violet-500/15 text-violet-300 group-hover:bg-violet-500/25' },
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
    <div className="min-h-screen bg-[#07070d] text-white antialiased overflow-x-hidden">
      <JsonLd data={[organizationSchema, websiteSchema]} />
      <NavClient />

      {/* Hero */}
      <section className="relative overflow-hidden pt-10 pb-0 grain">
        <AuroraBackground />
        {/* top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div className="text-center lg:text-left">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-violet-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                  Now Serving San Diego &amp; Southern California
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
                  Signing Agents,{' '}
                  <span className="animate-gradient bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-indigo-300 to-violet-400">
                    On Demand
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
                  Inksent connects title companies, escrow officers, and lenders with vetted NNA-certified signing agents — typically confirmed in about 30 minutes, with an automatic backup if anyone cancels.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-4">
                  <Link href="/order" className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-[0_0_40px_-8px_rgba(168,85,247,0.7)] hover:shadow-[0_0_55px_-6px_rgba(217,70,239,0.9)] hover:-translate-y-0.5 w-full sm:w-auto">
                    Place a Signing Order
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href="tel:+16199493361" className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/10 hover:border-white/25 transition-all w-full sm:w-auto backdrop-blur-sm">
                    <Phone size={18} />
                    (619) 949-3361
                  </a>
                </div>
                <p className="text-slate-500 text-sm">No contracts · No minimums · 30-min confirmation</p>
              </ScrollReveal>
            </div>

            {/* Right — product visual (scaled down on mobile) */}
            <div className="mt-4 lg:mt-0 scale-90 sm:scale-100">
              <PhoneMockup />
            </div>
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-16 border-t border-white/10 pt-10">
              <HeroStats />
            </div>
          </ScrollReveal>
        </div>

        {/* Signing type pills */}
        <ScrollReveal delay={500}>
          <div className="pb-16 px-6 mt-4">
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {SIGNING_TYPES.map(({ label, emoji }) => (
                <span key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 text-sm px-4 py-2 rounded-full hover:border-violet-400/40 hover:bg-violet-500/10 transition-colors cursor-default backdrop-blur-sm">
                  <span>{emoji}</span> {label}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Trust bar */}
      <div className="border-y border-white/10 bg-white/[0.02] py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-400 text-sm font-medium">
          {['NNA Certified Network', 'Background Checked', 'Transparent Pricing', 'Southern California'].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-violet-400" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* How it works — dynamic live showcase */}
      <section id="how-it-works" className="px-6 py-16 sm:py-24 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl font-black text-white">The future of notary assignment.</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Watch a signing go from request to done — automatically.</p>
          </ScrollReveal>
          <ScrollReveal>
            <ProcessShowcase />
          </ScrollReveal>
        </div>
      </section>

      {/* Why Inksent */}
      <section id="features" className="px-6 py-16 sm:py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <ScrollReveal className="text-center mb-16">
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-3">Why Title Companies Switch</p>
            <h2 className="text-4xl font-black text-white">Reliability the big platforms don&apos;t offer.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }, i) => {
              const a = ACCENTS[i % ACCENTS.length]
              return (
                <ScrollReveal key={title} delay={i * 70}>
                  <div className={`p-7 rounded-2xl bg-white/[0.03] border border-white/10 ${a.ring} ${a.glow} hover:bg-white/[0.05] hover:-translate-y-1.5 transition-all duration-300 group h-full backdrop-blur-sm`}>
                    <div className={`${a.icon} rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 transition-all duration-300`}>
                      {icon}
                    </div>
                    <h3 className="font-bold text-white mb-1.5 text-lg">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* About / founder credibility */}
      <section id="about" className="px-6 py-16 sm:py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[460px] h-[460px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.10) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <ScrollReveal>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 backdrop-blur-sm">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
                Built by the industry, for the industry
              </div>

              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Photo */}
                <div className="shrink-0 mx-auto sm:mx-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/clayton.png" alt="Clayton Rehm, Founder of Inksent"
                    className="rounded-2xl object-cover border border-white/15"
                    style={{ width: 150, height: 150 }} />
                  <div className="mt-3 text-center sm:text-left">
                    <div className="font-bold text-white">Clayton Rehm</div>
                    <div className="text-xs text-slate-400">Founder · Mortgage Loan Officer</div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                    Built by a mortgage pro who&apos;s been on your side of the table.
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    San Diego born and raised, Clayton is an active mortgage loan officer with deep roots in the industry — over <span className="text-white font-semibold">$200 million</span> in personal production and fundings, and working partnerships with title companies and large nationwide lenders.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    After watching too many closings get derailed by a late notary, a no-show, or a last-minute scramble for coverage, he built the signing service he always wished existed. Inksent isn&apos;t a faceless platform — it&apos;s built by someone who lives this work and knows exactly what a clean closing is worth.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
                {[
                  ['$200M+', 'In personal production'],
                  ['Nationwide', 'Lender & title partnerships'],
                  ['Active', 'Loan officer today'],
                ].map(([big, small]) => (
                  <div key={small} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                    <div className="text-2xl font-black text-white">{big}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{small}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Two paths */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal>
            <Link href="/partners" className="block h-full group rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 to-transparent p-8 hover:border-violet-400/50 transition-all">
              <Building2 className="text-violet-300 mb-4" size={28} />
              <h3 className="text-2xl font-black text-white mb-2">For Title Companies</h3>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">Faster, more reliable signings with automatic backup coverage. See exactly why escrow officers switch.</p>
              <span className="inline-flex items-center gap-1.5 text-violet-300 font-semibold text-sm group-hover:gap-2.5 transition-all">View overview <ArrowRight size={15} /></span>
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <Link href="/join" className="block h-full group rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/20 to-transparent p-8 hover:border-fuchsia-400/50 transition-all">
              <UserRoundCheck className="text-fuchsia-300 mb-4" size={28} />
              <h3 className="text-2xl font-black text-white mb-2">For Notaries</h3>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">Join free, get jobs by text, and earn $90 per signing — paid automatically. Plus a free Business Hub with earnings, payouts, and tax-ready mileage reports.</p>
              <span className="inline-flex items-center gap-1.5 text-fuchsia-300 font-semibold text-sm group-hover:gap-2.5 transition-all">Join the network <ArrowRight size={15} /></span>
            </Link>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={150}>
          <p className="text-center text-slate-400 text-sm mt-8">
            Title company? <Link href="/demo" className="text-violet-300 font-semibold hover:text-violet-200 underline underline-offset-2">See a live demo of your portal →</Link>
          </p>
        </ScrollReveal>
      </section>

      {/* Notary Business Hub */}
      <section id="notary-hub" className="px-6 py-16 sm:py-24 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Copy */}
            <ScrollReveal>
              <p className="text-fuchsia-400 font-semibold text-sm uppercase tracking-widest mb-3">Free for our agents</p>
              <h2 className="text-4xl sm:text-[2.75rem] font-black text-white leading-tight mb-5">
                Your whole notary business,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">in one dashboard.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Every Inksent agent gets the Notary Hub free — a private portal that tracks your earnings, shows exactly
                what you&apos;re owed, and turns your signings into tax-ready reports. No spreadsheets, no data entry.
                Not yet an Inksent agent? Apply to join — the Hub comes free with the network.
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 rounded-full px-3 py-1.5">100% free for approved Inksent agents</span>
              </div>

              <div className="space-y-4 mb-9">
                {[
                  { icon: <LayoutDashboard size={18} />, title: 'Live earnings dashboard', desc: 'Month-to-date, year-to-date, and per-job earnings with charts — updated automatically.' },
                  { icon: <Wallet size={18} />, title: 'Know what you’re owed', desc: 'See paid vs. pending payouts and a receivables-aging view. Never lose track of a check again.' },
                  { icon: <Car size={18} />, title: 'Automatic mileage log', desc: 'We estimate round-trip miles for every signing and tally your deduction at the IRS rate.' },
                  { icon: <Receipt size={18} />, title: 'One-click tax exports', desc: 'Download mileage and income CSVs for Schedule C at tax time. Hand them straight to your CPA.' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 w-9 h-9 shrink-0 rounded-lg bg-fuchsia-500/15 text-fuchsia-300 flex items-center justify-center">{f.icon}</span>
                    <div>
                      <p className="text-white font-bold text-[15px]">{f.title}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/hub/login" className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-7 py-3.5 rounded-xl font-bold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-[0_0_30px_-8px_rgba(217,70,239,0.8)] hover:-translate-y-0.5">
                  Open your Hub
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/join" className="inline-flex items-center justify-center border border-white/15 bg-white/5 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-all">
                  Become an agent
                </Link>
              </div>
            </ScrollReveal>

            {/* Dashboard preview */}
            <ScrollReveal delay={120}>
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/10 blur-3xl rounded-[2rem] pointer-events-none" />
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-white">Welcome back, Maria</p>
                    <span className="text-[10px] font-semibold text-fuchsia-300 bg-fuchsia-500/15 rounded-full px-2.5 py-1">Notary Hub</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { l: 'This month', v: '$1,840' },
                      { l: 'Pending', v: '$360' },
                      { l: 'YTD miles', v: '1,204' },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                        <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{s.l}</p>
                        <p className="text-lg font-black text-white tabular-nums leading-none">{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3">Earnings — last 6 months</p>
                    <div className="flex items-end gap-2 h-24">
                      {[45, 62, 38, 80, 70, 100].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-violet-500 to-fuchsia-400" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-3">Simple Pricing</p>
            <h2 className="text-4xl font-black text-white">Straightforward pricing. No surprises.</h2>
            <p className="text-slate-400 mt-3 text-lg">No contracts, no minimums, no hidden fees.</p>
          </ScrollReveal>
          <ScrollReveal>
            <div className="gradient-border max-w-sm mx-auto rounded-3xl p-8 text-center bg-gradient-to-b from-violet-600/15 to-white/[0.02] shadow-[0_0_70px_-15px_rgba(168,85,247,0.55)] backdrop-blur-sm">
              <p className="text-violet-300 font-semibold text-sm uppercase tracking-widest mb-4">Per Signing</p>
              <div className="mb-2 flex items-baseline justify-center gap-1">
                <span className="text-5xl sm:text-6xl font-black text-white leading-none">$200</span>
                <span className="text-slate-400 text-lg font-semibold">/ signing</span>
              </div>
              <p className="text-slate-400 text-sm mb-8">$200 refinance · $250 purchase — no hidden fees</p>
              <div className="space-y-3 text-left mb-8">
                {[
                  'All signing types — purchase, refi, HELOC, and more',
                  'NNA-certified, background-checked agent',
                  'Typically confirmed within ~30 minutes',
                  'Automatic backup if a notary cancels',
                  'Documents routed to your agent automatically',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle size={15} className="text-violet-400 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/order" className="block w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-3.5 rounded-xl font-bold text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-[0_0_30px_-8px_rgba(217,70,239,0.8)] hover:-translate-y-0.5">
                Place an Order
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Coverage map */}
      <section id="coverage" className="px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-10">
            <p className="text-violet-400 font-semibold text-sm uppercase tracking-widest mb-3">Where We Serve</p>
            <h2 className="text-4xl font-black text-white mb-3">San Diego &amp; Southern California</h2>
            <p className="text-slate-400 max-w-lg mx-auto">We&apos;re focused on Southern California today and expanding. Tap your area to check coverage.</p>
          </ScrollReveal>
          <ScrollReveal>
            <USMap />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
              Ready to close{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">faster?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10">No contracts. No minimums. Reliable signings, typically confirmed in ~30 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="group inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-violet-500 transition-all shadow-[0_0_40px_-8px_rgba(139,92,246,0.8)] hover:-translate-y-0.5">
                Place an Order Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="mailto:support@inksent.co" className="inline-flex items-center justify-center border border-white/15 bg-white/5 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                Email Us
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <InksentLogo size="md" dark />
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-500">
              <a href="tel:+16199493361" className="hover:text-slate-300 transition-colors flex items-center gap-1.5"><Phone size={13} />(619) 949-3361</a>
              <span className="hidden sm:block">·</span>
              <a href="mailto:support@inksent.co" className="hover:text-slate-300 transition-colors">support@inksent.co</a>
              <span className="hidden sm:block">·</span>
              <Link href="/join" className="hover:text-slate-300 transition-colors">For Notaries</Link>
              <span className="hidden sm:block">·</span>
              <Link href="/hub/login" className="hover:text-slate-300 transition-colors">Notary Login</Link>
              <span className="hidden sm:block">·</span>
              <Link href="/partners" className="hover:text-slate-300 transition-colors">For Title Companies</Link>
              <span className="hidden sm:block">·</span>
              <Link href="/order" className="hover:text-slate-300 transition-colors">Place an Order</Link>
            </div>
          </div>
          {/* Service-area links — internal links help these pages rank locally */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="text-slate-500 font-semibold">San Diego:</span>
            <Link href="/notary-signing-service-san-diego" className="hover:text-slate-400 transition-colors">Notary Signing Service</Link>
            <span>·</span>
            <Link href="/notary-signing-agent-jobs-san-diego" className="hover:text-slate-400 transition-colors">Signing Agent Jobs</Link>
            <span>·</span>
            <Link href="/resources" className="hover:text-slate-400 transition-colors">Resources</Link>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} Inksent Signing Services · All rights reserved</span>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-slate-400 transition-colors">About</Link>
              <Link href="/faq" className="hover:text-slate-400 transition-colors">FAQ</Link>
              <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-slate-400 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
