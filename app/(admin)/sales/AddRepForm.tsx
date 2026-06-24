'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/lib/utils'

// Add a sales rep. Commission terms are pre-filled with your standard deal
// ($15/signing, $200 bonus at 25 signings) and editable per rep.
export default function AddRepForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/sales/reps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone,
        residual_per_signing_cents: Math.round(parseFloat(form.get('residual') as string) * 100) || undefined,
        residual_months: parseInt(form.get('months') as string) || undefined,
        residual_after_cents: Math.round(parseFloat(form.get('residual_after') as string) * 100) || undefined,
        producer_bonus_cents: Math.round(parseFloat(form.get('bonus') as string) * 100) || undefined,
        bonus_threshold: parseInt(form.get('threshold') as string) || undefined,
        notes: form.get('notes'),
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Could not add rep')
      return
    }
    setPhone('')
    ;(e.target as HTMLFormElement).reset()
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">+ Add Sales Rep</Button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-1">Add Sales Rep</h3>
      <p className="text-xs text-gray-400 mb-4">Terms default to your standard deal — adjust per rep if needed.</p>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input id="name" name="name" label="Full Name *" placeholder="Jamie Closer" required />
          <Input id="email" name="email" type="email" label="Email *" placeholder="jamie@email.com" required />
        </div>
        <Input id="phone" label="Phone" placeholder="(619) 555-0100" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />

        <div className="grid grid-cols-3 gap-3">
          <Input id="residual" name="residual" type="number" step="0.5" label="$/signing (first)" defaultValue="15" />
          <Input id="months" name="months" type="number" step="1" label="Full-rate months" defaultValue="24" />
          <Input id="residual_after" name="residual_after" type="number" step="0.5" label="$/signing after" defaultValue="8" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="bonus" name="bonus" type="number" step="1" label="Producer bonus $" defaultValue="200" />
          <Input id="threshold" name="threshold" type="number" step="1" label="Bonus at N signings" defaultValue="25" />
        </div>
        <Input id="notes" name="notes" label="Notes" placeholder="Optional" />

        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={loading}>Add Rep</Button>
          <Button type="button" variant="secondary" onClick={() => { setOpen(false); setError(null) }}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
