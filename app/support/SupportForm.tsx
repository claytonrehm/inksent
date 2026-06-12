'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const ROLES = ['Title / escrow company', 'Signing agent', 'Lender', 'Signer / borrower', 'Other']

export default function SupportForm() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: (fd.get('name') as string)?.trim(),
      email: (fd.get('email') as string)?.trim(),
      role: (fd.get('role') as string) || undefined,
      message: (fd.get('message') as string)?.trim(),
      company_website: fd.get('company_website') || undefined, // honeypot
      pageUrl: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    }
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Something went wrong. Please email support@inksent.co directly.')
        setBusy(false)
        return
      }
      setDone(true)
    } catch {
      setError('We couldn\'t send your report. Please check your connection or email support@inksent.co.')
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="bg-green-50 rounded-full p-4"><CheckCircle2 className="text-green-500 w-11 h-11" /></div>
        <h2 className="text-2xl font-black text-gray-900">Got it — thank you!</h2>
        <p className="text-gray-500 max-w-sm">Your report came straight to us and we&apos;ll follow up at the email you provided. For anything urgent, call or text <a href="tel:+16199493361" className="text-violet-600 font-semibold">(619) 949-3361</a>.</p>
      </div>
    )
  }

  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Honeypot */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sup-name" className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
          <input id="sup-name" name="name" required className={input} placeholder="Jane Smith" />
        </div>
        <div>
          <label htmlFor="sup-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="sup-email" name="email" type="email" required className={input} placeholder="you@company.com" />
        </div>
      </div>

      <div>
        <label htmlFor="sup-role" className="block text-sm font-medium text-gray-700 mb-1">I&apos;m a…</label>
        <select id="sup-role" name="role" className={input} defaultValue="">
          <option value="" disabled>Select…</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="sup-message" className="block text-sm font-medium text-gray-700 mb-1">What&apos;s the issue?</label>
        <textarea id="sup-message" name="message" required rows={5} className={input} placeholder="Tell us what happened — what you were doing, what page you were on, and what went wrong." />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <button type="submit" disabled={busy} className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 disabled:opacity-50">
        {busy ? 'Sending…' : 'Send Report'}
      </button>
    </form>
  )
}
