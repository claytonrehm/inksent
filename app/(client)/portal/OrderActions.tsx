'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, X } from 'lucide-react'

export default function OrderActions({
  orderId, status, signingDate, signingTime,
}: {
  orderId: string
  status: string
  signingDate: string
  signingTime: string
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'idle' | 'reschedule'>('idle')
  const [date, setDate] = useState(signingDate)
  const [time, setTime] = useState(signingTime)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Only open orders can be changed by the client.
  if (['completed', 'cancelled'].includes(status)) {
    return <span className="text-gray-300 text-xs">—</span>
  }

  async function cancel() {
    if (!confirm('Cancel this signing? If you’ve already paid, it will be refunded automatically.')) return
    setBusy(true); setError('')
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
    setBusy(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not cancel.'); return }
    router.refresh()
  }

  async function reschedule() {
    setBusy(true); setError('')
    const res = await fetch(`/api/orders/${orderId}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signing_date: date, signing_time: time }),
    })
    setBusy(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not reschedule.'); return }
    setMode('idle'); router.refresh()
  }

  if (mode === 'reschedule') {
    return (
      <div className="flex flex-col gap-2 min-w-[180px]">
        <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs" />
        <div className="flex gap-2">
          <button type="button" onClick={reschedule} disabled={busy}
            className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded hover:bg-violet-700 disabled:opacity-50">
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => { setMode('idle'); setError('') }} className="text-xs text-gray-500 hover:text-gray-800 px-2">Cancel</button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => setMode('reschedule')} disabled={busy}
        className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-violet-700 disabled:opacity-50">
        <Calendar size={12} /> Reschedule
      </button>
      <button type="button" onClick={cancel} disabled={busy}
        className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 disabled:opacity-50">
        <X size={12} /> Cancel
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
