import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import { CheckCircle2, Clock, MapPin, Truck, FileText, Star, TrendingUp, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Live Demo — Inksent Title Partner Portal',
  description: 'See exactly what your title company portal looks like with Inksent — orders, live tracking, invoices, and metrics.',
}

const STATS = [
  { label: 'Active signings', value: '3', icon: <Truck size={15} /> },
  { label: 'Completed this month', value: '47', icon: <CheckCircle2 size={15} /> },
  { label: 'On-time rate', value: '98%', icon: <Clock size={15} />, good: true },
  { label: 'Avg confirm time', value: '11 min', icon: <TrendingUp size={15} /> },
  { label: 'Client satisfaction', value: '96% 👍', icon: <Star size={15} />, good: true },
  { label: 'Est. staff hours saved', value: '31 hrs', icon: <TrendingUp size={15} /> },
]

type Row = { conf: string; date: string; signer: string; loc: string; agent: string; fee: string; status: string; color: string }
const ORDERS: Row[] = [
  { conf: 'ND-260610-A1B2C3', date: 'Today · 4:00 PM', signer: 'Maria & Luis Reyes', loc: 'Chula Vista, CA', agent: 'En route — Rosaura O.', fee: '$185', status: 'En Route', color: 'bg-blue-100 text-blue-800' },
  { conf: 'ND-260610-D4E5F6', date: 'Today · 1:30 PM', signer: 'James Whitfield', loc: 'Carlsbad, CA', agent: 'Confirmed — Mikhail S.', fee: '$185', status: 'Agent Confirmed', color: 'bg-violet-100 text-violet-800' },
  { conf: 'ND-260610-G7H8I9', date: 'Today · 5:30 PM', signer: 'Priya Nair', loc: 'Irvine, CA', agent: 'Finding agent…', fee: '$185', status: 'Finding Agent', color: 'bg-amber-100 text-amber-800' },
  { conf: 'ND-260609-J1K2L3', date: 'Yesterday', signer: 'Robert Chen', loc: 'San Diego, CA', agent: 'Lynn Daniels', fee: '$185', status: 'Completed', color: 'bg-green-100 text-green-800' },
  { conf: 'ND-260609-M4N5O6', date: 'Yesterday', signer: 'Tara Mitchell', loc: 'El Cajon, CA', agent: 'Marika Dalesandro', fee: '$185', status: 'Completed', color: 'bg-green-100 text-green-800' },
  { conf: 'ND-260608-P7Q8R9', date: 'Jun 8', signer: 'David & Anne Park', loc: 'Temecula, CA', agent: 'Michael Krause', fee: '$185', status: 'Completed', color: 'bg-green-100 text-green-800' },
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
  searchParams: Promise<{ co?: string; contact?: string; logo?: string; email?: string }>
}) {
  const sp = await searchParams
  const company = sp.co?.trim() || 'Summit Title Co.'
  const contact = sp.contact?.trim() || 'Jordan'
  const logo = sp.logo?.trim()
  const handle = company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'yourtitle'
  const email = sp.email?.trim() || `${contact.toLowerCase()}@${handle}.com`

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-violet-600 text-white text-center text-xs font-semibold py-2 px-4">
        ✨ Live demo with sample data — this is exactly what {company}&apos;s portal looks like. <Link href="/partners/apply" className="underline">Become a partner →</Link>
      </div>

      {/* Branded header (co-brand with the prospect) */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={logo} alt={company} className="h-9 max-w-[180px] object-contain" />
              : <div className="font-black text-lg text-gray-900">{company}</div>}
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">powered by <InksentLogo size="sm" /></span>
          </div>
          <span className="text-sm text-gray-500">{email}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Welcome back, {contact}</h1>
            <p className="text-gray-500 text-sm mt-1">Your signings at a glance</p>
          </div>
          <Link href="/order" className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700">
            + New Signing Order
          </Link>
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

        {/* Live tracking sample */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-violet-600" />
            <h2 className="font-bold text-gray-900">Live — Maria &amp; Luis Reyes signing</h2>
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">On the way · ETA 4:00 PM</span>
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
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Orders</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Confirmation</th>
                  <th className="px-5 py-3 text-left">When</th>
                  <th className="px-5 py-3 text-left">Signer</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-left">Agent</th>
                  <th className="px-5 py-3 text-left">Fee</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ORDERS.map((o) => (
                  <tr key={o.conf} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{o.conf}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-700">{o.date}</td>
                    <td className="px-5 py-3 text-gray-900 font-medium whitespace-nowrap">{o.signer}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{o.loc}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{o.agent}</td>
                    <td className="px-5 py-3 text-gray-900">{o.fee}</td>
                    <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${o.color}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice + closeout sample */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <div className="flex items-center gap-2 mb-2"><FileText size={16} className="text-violet-600" /><h3 className="font-bold text-gray-900">Invoices</h3></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">INV-9F2K · Robert Chen</span><span className="text-green-600 font-medium">Paid</span></div>
              <div className="flex justify-between"><span className="text-gray-600">INV-9F1A · Tara Mitchell</span><span className="text-amber-600 font-medium">Pay now →</span></div>
              <div className="flex justify-between"><span className="text-gray-600">INV-8E7C · David &amp; Anne Park</span><span className="text-green-600 font-medium">Paid</span></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Pay by card, check, or ACH — net 30 available.</p>
          </div>
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
