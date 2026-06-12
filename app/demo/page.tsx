import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import CoverageCheck from '@/components/CoverageCheck'
import ClientCoverageMap, { type CoverageArea } from '@/components/ClientCoverageMap'
import BrandHeader from './BrandHeader'
import DemoSectionNav from '@/components/DemoSectionNav'
import DemoOrders, { type DemoOrder } from './DemoOrders'
import DemoInvoices, { type DemoInvoice } from './DemoInvoices'
import DemoOrderButton from './DemoOrderButton'
import { createClient } from '@/lib/supabase/server'
import { lookupZip } from '@/lib/coverage'
import { credentialsEligible } from '@/lib/credentials'
import { CheckCircle2, Clock, MapPin, Truck, Star, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Live Demo — Inksent Title Partner Portal',
  description: 'See exactly what your title company portal looks like with Inksent — orders, live tracking, invoices, and metrics.',
  robots: { index: false, follow: false },
}

const STATS = [
  { label: 'Active signings', value: '3', icon: <Truck size={15} /> },
  { label: 'Completed this month', value: '47', icon: <CheckCircle2 size={15} /> },
  { label: 'On-time rate', value: '98%', icon: <Clock size={15} />, good: true },
  { label: 'Avg confirm time', value: '11 min', icon: <TrendingUp size={15} /> },
  { label: 'Client satisfaction', value: '96% 👍', icon: <Star size={15} />, good: true },
  { label: 'Est. staff hours saved', value: '31 hrs', icon: <TrendingUp size={15} /> },
]

const ORDERS: DemoOrder[] = [
  { ref: 'SUM-26-1087', conf: 'ND-260610-A1B2C3', date: 'Today · 4:00 PM', signer: 'Maria & Luis Reyes', loc: 'Chula Vista, CA', agent: 'En route — Rosaura O.', fee: '$250', status: 'En Route', color: 'bg-blue-100 text-blue-800', type: 'Purchase' },
  { ref: 'SUM-26-1085', conf: 'ND-260610-D4E5F6', date: 'Today · 1:30 PM', signer: 'James Whitfield', loc: 'Carlsbad, CA', agent: 'Confirmed — Mikhail S.', fee: '$200', status: 'Agent Confirmed', color: 'bg-violet-100 text-violet-800', type: 'Refinance' },
  { ref: 'SUM-26-1090', conf: 'ND-260610-G7H8I9', date: 'Today · 5:30 PM', signer: 'Priya Nair', loc: 'Irvine, CA', agent: 'Finding agent…', fee: '$200', status: 'Finding Agent', color: 'bg-amber-100 text-amber-800', type: 'HELOC' },
  { ref: 'SUM-26-1079', conf: 'ND-260609-J1K2L3', date: 'Yesterday', signer: 'Robert Chen', loc: 'San Diego, CA', agent: 'Lynn Daniels', fee: '$200', status: 'Completed', color: 'bg-green-100 text-green-800', type: 'Refinance' },
  { ref: 'SUM-26-1078', conf: 'ND-260609-M4N5O6', date: 'Yesterday', signer: 'Tara Mitchell', loc: 'El Cajon, CA', agent: 'Marika Dalesandro', fee: '$250', status: 'Completed', color: 'bg-green-100 text-green-800', type: 'Purchase' },
  { ref: 'SUM-26-1074', conf: 'ND-260608-P7Q8R9', date: 'Jun 8', signer: 'David & Anne Park', loc: 'Temecula, CA', agent: 'Michael Krause', fee: '$200', status: 'Completed', color: 'bg-green-100 text-green-800', type: 'Seller Package' },
]

const INVOICES: DemoInvoice[] = [
  { inv: 'INV-9F2K', signer: 'Robert Chen', type: 'Refinance', date: 'Jun 9', loc: 'San Diego, CA', amount: '$200', status: 'Paid' },
  { inv: 'INV-9F1A', signer: 'Tara Mitchell', type: 'Purchase', date: 'Jun 9', loc: 'El Cajon, CA', amount: '$250', status: 'Due' },
  { inv: 'INV-8E7C', signer: 'David & Anne Park', type: 'Seller Package', date: 'Jun 8', loc: 'Temecula, CA', amount: '$200', status: 'Paid' },
]

const TIMELINE = [
  { label: 'Order received', done: true },
  { label: 'Finding your agent', done: true },
  { label: 'Agent confirmed — Rosaura Ortega Lopez', done: true },
  { label: 'On the way', done: true, active: true },
  { label: 'Signing complete', done: false },
]

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ co?: string; contact?: string; name?: string; logo?: string; email?: string; domain?: string }>
}) {
  const sp = await searchParams
  const company = sp.co?.trim() || 'Summit Settlement Services'
  const logo = sp.logo?.trim()
  // Auto-pull the company's site icon from their domain (no API key needed).
  const domain = sp.domain?.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : undefined
  // `email` is the source of truth (matches what they'd sign in with). Name comes
  // from ?name=, else ?contact=, else derived from the email, else a default.
  const emailParam = sp.email?.trim()
  const nameFromEmail = emailParam
    ? emailParam.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : ''
  const fullName = sp.name?.trim() || sp.contact?.trim() || nameFromEmail || 'Jordan Mathis'
  const firstName = fullName.split(' ')[0]
  const handle = company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'yourtitle'
  const email = emailParam || `${firstName.toLowerCase()}@${handle}.com`

  // Real (anonymized) coverage footprint for the map + covered-cities list.
  const supabase = await createClient()
  const { data: bench } = await supabase
    .from('notaries')
    .select('base_zip, coverage_radius, nna_certified, nna_cert_expiry, background_checked, bgc_date, eo_carrier, eo_expiry, commission_expiry')
    .eq('active', true)
    .not('onboarded_at', 'is', null)
  const areas: CoverageArea[] = []
  const cities = new Set<string>()
  for (const n of bench ?? []) {
    if (!credentialsEligible(n)) continue // vetted & verified, not lapsed (expiring still counts)
    const info = n.base_zip ? lookupZip(n.base_zip) : null
    if (!info) continue
    areas.push({ lat: info.latitude, lng: info.longitude, radiusMiles: n.coverage_radius ?? 25 })
    cities.add(`${info.city}, ${info.state}`)
  }
  const coveredCities = Array.from(cities).sort()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-violet-600 text-white text-center text-xs font-semibold py-2 px-4">
        ✨ Live demo with sample data — this is exactly what {company}&apos;s portal looks like. <Link href="/partners/apply" className="underline">Become a partner →</Link>
      </div>

      {/* Branded header (co-brand with the prospect) */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BrandHeader logo={logo} favicon={favicon} company={company} />
            <span className="hidden sm:inline text-gray-300">·</span>
            <span className="hidden sm:flex text-xs text-gray-400 items-center gap-1">powered by <InksentLogo size="sm" /></span>
          </div>
          <div className="text-right leading-tight min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{fullName}</div>
            <div className="text-xs text-gray-400 truncate max-w-[150px] sm:max-w-none">{email}</div>
          </div>
        </div>
      </div>

      <DemoSectionNav />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div id="overview" className="scroll-mt-20 flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Welcome back, {firstName}</h1>
            <p className="text-gray-500 text-sm mt-1">Your signings at a glance</p>
          </div>
          <DemoOrderButton />
        </div>

        {/* Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">{s.icon}</div>
              <p className={`text-2xl font-black ${s.good ? 'text-green-600' : 'text-gray-900'}`}>{s.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Trust / compliance — the title company's #1 concern */}
        <div id="compliance" className="scroll-mt-20 bg-white rounded-2xl border border-gray-100 shadow-md p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2"><ShieldCheck size={15} className="text-violet-600" /> Every agent, every time</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['NNA-Certified', 'Trained, tested loan-signing agents'],
              ['Background-Checked', 'Current screening on file'],
              ['E&O-Insured', '$25k+ coverage, verified'],
              ['Auto-Verified', 'Credentials re-checked before every job'],
            ].map(([t, d]) => (
              <div key={t} className="flex flex-col items-center text-center">
                <CheckCircle2 size={20} className="text-green-500 mb-1.5" />
                <p className="font-bold text-gray-900 text-sm">{t}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{d}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 bg-gray-50 rounded-lg px-4 py-3 leading-relaxed">
            We monitor every agent&apos;s NNA cert, background check, E&amp;O insurance, and commission automatically — an expired credential <strong>auto-removes them from dispatch</strong>, so an uninsured or lapsed agent can never be assigned to your closing. The liability is covered before we ever send someone.
          </p>
        </div>

        {/* Coverage — honest footprint + real-time check */}
        <div id="coverage" className="scroll-mt-20">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin size={14} className="text-violet-600" /> Where we cover for you</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-3">
              {areas.length > 0
                ? <ClientCoverageMap areas={areas} />
                : <div className="h-72 flex items-center justify-center text-sm text-gray-400">Coverage map appears once agents are active in your region.</div>}
              {coveredCities.length > 0 && (
                <div className="px-2 pt-3 pb-1">
                  <p className="text-xs text-gray-500 mb-1.5">Currently serving:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coveredCities.map((c) => (
                      <span key={c} className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <CoverageCheck />
              <p className="text-xs text-gray-400 px-1">We&apos;re expanding continuously — if your area isn&apos;t covered yet, tell us and we&apos;ll prioritize building it for {company}.</p>
            </div>
          </div>
        </div>

        {/* Live tracking sample */}
        <div id="tracking" className="scroll-mt-20 bg-white rounded-2xl border border-gray-100 shadow-md p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <MapPin size={16} className="text-violet-600 shrink-0" />
            <h2 className="font-bold text-gray-900">Live — Maria &amp; Luis Reyes signing</h2>
            <span className="sm:ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">On the way · ETA 4:00 PM</span>
          </div>
          <p className="text-sm text-gray-500 mb-5">Chula Vista, CA · Purchase · Confirmation ND-260610-A1B2C3</p>
          <div className="space-y-3">
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${t.done ? (t.active ? 'bg-blue-500' : 'bg-green-500') : 'bg-gray-200'}`}>
                  {t.done && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className={`text-sm ${t.active ? 'font-semibold text-blue-700' : t.done ? 'text-gray-700' : 'text-gray-400'}`}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders table */}
        <div id="orders" className="scroll-mt-20">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Orders</h2>
          <DemoOrders orders={ORDERS} />
        </div>

        {/* Invoice + closeout sample */}
        <div id="invoices" className="scroll-mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DemoInvoices invoices={INVOICES} company={company} />
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl shadow-md p-6 text-white flex flex-col justify-center">
            <p className="text-violet-100 text-sm font-semibold">This month with Inksent</p>
            <p className="text-3xl font-black mt-1">47 signings · 98% on-time</p>
            <p className="text-violet-100 text-sm mt-2">Zero phone tag. Vetted, insured agents. Your team focused on closings, not chasing notaries.</p>
            <Link href="/partners/apply" className="mt-4 inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-5 py-2.5 rounded-xl w-fit hover:bg-violet-50">
              Set up your team <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">Sample environment with demo data. Your live portal looks exactly like this, with your real signings. · Inksent Signing Services</p>
      </div>
    </main>
  )
}
