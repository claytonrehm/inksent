'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function TitleInterestForm() {
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      company: (fd.get('company') as string)?.trim(),
      name: (fd.get('name') as string)?.trim(),
      email: (fd.get('email') as string)?.trim(),
      volume: (fd.get('volume') as string) || undefined,
      company_website: fd.get('company_website') || undefined,
    }
    try {
      const res = await fetch('/api/signcheck-interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Something went wrong. Email support@inksent.co.'); setBusy(false); return }
      setDone(true)
    } catch { setError('Couldn\'t send. Please email support@inksent.co.'); setBusy(false) }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 text-white">
        <CheckCircle2 size={20} /> <span className="text-sm font-medium">Got it — we&apos;ll reach out to get your team set up.</span>
      </div>
    )
  }

  const input = 'w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder-violet-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/40'

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="company" required aria-label="Company" className={input} placeholder="Company name" />
        <input name="name" required aria-label="Your name" className={input} placeholder="Your name" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="email" type="email" required aria-label="Work email" className={input} placeholder="Work email" />
        <input name="volume" aria-label="Signings per month" className={input} placeholder="Signings / month (optional)" />
      </div>
      {error && <p className="text-sm text-white bg-red-500/30 border border-white/20 rounded-lg px-3 py-2">{error}</p>}
      <button type="submit" disabled={busy} className="bg-white text-violet-700 font-bold px-6 py-2.5 rounded-xl hover:bg-violet-50 disabled:opacity-60">
        {busy ? 'Sending…' : 'Get SignCheck for our team'}
      </button>
    </form>
  )
}
