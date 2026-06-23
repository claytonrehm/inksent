'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SalesRepRow } from '@/lib/sales'

// Edit a rep's contact info, active/inactive status, and commission terms.
export default function EditRepForm({ rep }: { rep: SalesRepRow }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setOk(false)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch(`/api/admin/sales/reps/${rep.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        status: form.get('status'),
        residual_per_signing_cents: Math.round(parseFloat(form.get('residual') as string) * 100) || undefined,
        producer_bonus_cents: Math.round(parseFloat(form.get('bonus') as string) * 100) || undefined,
        bonus_threshold: parseInt(form.get('threshold') as string) || undefined,
        notes: form.get('notes'),
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Could not save')
      return
    }
    setOk(true)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Input id="name" name="name" label="Full Name" defaultValue={rep.name} required />
        <Input id="email" name="email" type="email" label="Email" defaultValue={rep.email} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input id="phone" name="phone" label="Phone" defaultValue={rep.phone ?? ''} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue={rep.status}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input id="residual" name="residual" type="number" step="0.5" label="$/signing" defaultValue={(rep.residual_per_signing_cents / 100).toString()} />
        <Input id="bonus" name="bonus" type="number" step="1" label="Producer bonus $" defaultValue={(rep.producer_bonus_cents / 100).toString()} />
        <Input id="threshold" name="threshold" type="number" step="1" label="Bonus at N signings" defaultValue={rep.bonus_threshold.toString()} />
      </div>
      <Input id="notes" name="notes" label="Notes" defaultValue={rep.notes ?? ''} />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {ok && <p className="text-xs text-green-600">Saved.</p>}
      <Button type="submit" loading={loading}>Save Changes</Button>
    </form>
  )
}
