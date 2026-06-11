'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function PartnerApplyForm() {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState({
    company: '', contact_name: '', email: '', phone: '', role: '',
    monthly_volume: '', billing_preference: '', message: '', company_url: '',
  })
  function set(k: keyof typeof f, v: string) { setF((p) => ({ ...p, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.company || !f.contact_name || !f.email) { setError('Company, your name, and email are required.'); return }
    setBusy(true); setError('')
    const res = await fetch('/api/partner-apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    setBusy(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Something went wrong.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 text-center">
        <div className="bg-green-50 rounded-full p-5 w-fit mx-auto mb-4"><CheckCircle className="text-green-500 w-12 h-12" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks — we&apos;ll be in touch within one business day.</h2>
        <p className="text-gray-500 max-w-sm mx-auto">We&apos;ll set up your account, confirm billing, and (if you like) handle your first signing concierge-style so you can see how it works.</p>
      </div>
    )
  }

  const input = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
  const label = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 space-y-4">
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={f.company_url} onChange={(e) => set('company_url', e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={label}>Company *</label><input className={input} value={f.company} onChange={(e) => set('company', e.target.value)} placeholder="First American Title" /></div>
        <div><label className={label}>Your name *</label><input className={input} value={f.contact_name} onChange={(e) => set('contact_name', e.target.value)} /></div>
        <div><label className={label}>Work email *</label><input type="email" className={input} value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div><label className={label}>Phone</label><input className={input} value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        <div><label className={label}>Your role</label><input className={input} value={f.role} onChange={(e) => set('role', e.target.value)} placeholder="Escrow officer, branch manager…" /></div>
        <div>
          <label className={label}>Signings / month</label>
          <select className={input} value={f.monthly_volume} onChange={(e) => set('monthly_volume', e.target.value)}>
            <option value="">Select…</option>
            <option>1–10</option><option>10–25</option><option>25–50</option><option>50–100</option><option>100+</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Billing preference</label>
          <select className={input} value={f.billing_preference} onChange={(e) => set('billing_preference', e.target.value)}>
            <option value="">No preference</option>
            <option value="per_signing">Pay per signing</option>
            <option value="net_30">Monthly invoice (net 30)</option>
          </select>
        </div>
      </div>
      <div><label className={label}>Anything else?</label><textarea className={input} rows={3} value={f.message} onChange={(e) => set('message', e.target.value)} placeholder="Areas you close in, current pain points, timeline…" /></div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
      <button type="submit" disabled={busy} className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50">
        {busy ? 'Submitting…' : 'Request Partnership'}
      </button>
      <p className="text-center text-xs text-gray-400">No commitment — we&apos;ll reach out to get you set up.</p>
    </form>
  )
}
