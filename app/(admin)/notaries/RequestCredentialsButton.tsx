'use client'

import { useState } from 'react'
import { MailCheck } from 'lucide-react'

export default function RequestCredentialsButton() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function send() {
    if (!confirm('Email + text every active notary who is missing or expiring on any credential (NNA, background check, E&O, commission) with a link to provide it. Send now?')) return
    setBusy(true); setResult(null)
    const res = await fetch('/api/admin/request-credentials', { method: 'POST' })
    setBusy(false)
    if (!res.ok) { setResult('Something went wrong — try again.'); return }
    const j = await res.json().catch(() => ({}))
    setResult(j.sent === 0 ? '✓ Everyone is already fully credentialed — nothing to send.' : `✓ Sent to ${j.sent} agent${j.sent === 1 ? '' : 's'} missing something.`)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={send} disabled={busy}
        className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50">
        <MailCheck size={15} /> {busy ? 'Sending…' : 'Request missing credentials'}
      </button>
      {result && <span className="text-xs text-gray-500">{result}</span>}
    </div>
  )
}
