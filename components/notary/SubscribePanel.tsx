'use client'

import { useState } from 'react'
import { Check, Car, Wallet, LayoutDashboard, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlanOption {
  key: string
  label: string
  amountLabel: string
  period: string
  note?: string
}

const PERKS = [
  { icon: <LayoutDashboard size={16} />, text: 'Live earnings dashboard with charts' },
  { icon: <Wallet size={16} />, text: 'Track who owes you — paid vs. pending' },
  { icon: <Car size={16} />, text: 'Automatic mileage log at the IRS rate' },
  { icon: <Receipt size={16} />, text: 'One-click mileage + income CSV exports' },
]

export default function SubscribePanel({
  defaultName,
  defaultBaseZip,
  billingEnabled,
  trialDays,
  plans,
}: {
  defaultName: string
  defaultBaseZip: string
  billingEnabled: boolean
  trialDays: number
  plans: PlanOption[]
}) {
  const [name, setName] = useState(defaultName)
  const [baseZip, setBaseZip] = useState(defaultBaseZip)
  const [plan, setPlan] = useState(plans.find((p) => p.key === 'annual')?.key ?? plans[0]?.key ?? 'monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const field = 'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500'

  async function subscribe() {
    setError(null)
    if (!name.trim()) return setError('Enter your name.')
    if (!/^\d{5}$/.test(baseZip)) return setError('Enter your 5-digit home/base ZIP (used for mileage estimates).')
    setLoading(true)
    const res = await fetch('/api/hub/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, name: name.trim(), baseZip }),
    })
    const data = await res.json().catch(() => ({}))
    if (data.url) {
      window.location.href = data.url
      return
    }
    setLoading(false)
    setError(data.error === 'billing not configured' ? 'Subscriptions aren’t open yet.' : 'Something went wrong — try again.')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-7 max-w-lg w-full">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Start your Notary Hub</h1>
      <p className="text-gray-500 text-sm mb-6">
        {billingEnabled ? `Free for ${trialDays} days, then your plan. Cancel anytime.` : 'Subscriptions are opening soon.'}
      </p>

      <ul className="space-y-2.5 mb-7">
        {PERKS.map((p) => (
          <li key={p.text} className="flex items-center gap-3 text-sm text-gray-700">
            <span className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">{p.icon}</span>
            {p.text}
          </li>
        ))}
      </ul>

      {!billingEnabled ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Subscriptions aren&apos;t open quite yet. Email{' '}
          <a href="mailto:support@inksent.co" className="underline font-semibold">support@inksent.co</a> and we&apos;ll
          get you early access.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {plans.map((p) => (
              <button
                key={p.key}
                onClick={() => setPlan(p.key)}
                className={cn(
                  'text-left rounded-xl border-2 p-4 transition-all',
                  plan === p.key ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{p.label}</span>
                  {plan === p.key && <Check size={15} className="text-violet-600" />}
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-gray-900">{p.amountLabel}</span>
                  <span className="text-sm text-gray-400 font-semibold">{p.period}</span>
                </div>
                {p.note && <p className="text-[11px] text-emerald-600 font-medium mt-1">{p.note}</p>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Jane Notary" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Base ZIP</label>
              <input value={baseZip} maxLength={5} onChange={(e) => setBaseZip(e.target.value.replace(/\D/g, ''))} className={field} placeholder="92101" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

          <button
            onClick={subscribe}
            disabled={loading}
            className="w-full bg-violet-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Starting…' : `Start ${trialDays}-day free trial`}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">No charge today · Cancel anytime</p>
        </>
      )}
    </div>
  )
}
