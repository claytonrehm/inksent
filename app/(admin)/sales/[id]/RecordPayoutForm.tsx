'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Record a commission payment made to a rep (ledger entry; does not move money).
// Amount is pre-filled with what's currently owed.
export default function RecordPayoutForm({ repId, owedCents }: { repId: string; owedCents: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const suggested = owedCents > 0 ? (owedCents / 100).toFixed(2) : ''

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/sales/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sales_rep_id: repId,
        amount_cents: Math.round(parseFloat(form.get('amount') as string) * 100),
        paid_at: form.get('paid_at') || null,
        period_label: form.get('period_label') || null,
        note: form.get('note') || null,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Could not record payout')
      return
    }
    ;(e.target as HTMLFormElement).reset()
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input id="amount" name="amount" type="number" step="0.01" label="Amount $ *" defaultValue={suggested} placeholder="0.00" required />
        <Input id="paid_at" name="paid_at" type="date" label="Paid on" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input id="period_label" name="period_label" label="Period" placeholder="June 2026" />
        <Input id="note" name="note" label="Note" placeholder="Optional" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>Record Payout</Button>
    </form>
  )
}
