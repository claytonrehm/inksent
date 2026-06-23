'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface RepOption { id: string; name: string }

// Attribute a title-company account to a rep. Used on the main portal (pick the
// rep) and on a rep's detail page (rep fixed). The company datalist suggests
// names already seen in orders that aren't attributed yet.
export default function AssignAccountForm({
  reps,
  fixedRepId,
  companySuggestions = [],
  presetCompany = '',
}: {
  reps: RepOption[]
  fixedRepId?: string
  companySuggestions?: string[]
  presetCompany?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState(presetCompany)
  const [repId, setRepId] = useState(fixedRepId ?? reps[0]?.id ?? '')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/sales/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sales_rep_id: fixedRepId ?? repId,
        company_name: company,
        landed_at: form.get('landed_at') || null,
        notes: form.get('notes') || null,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Could not assign account')
      return
    }
    setCompany('')
    ;(e.target as HTMLFormElement).reset()
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {!fixedRepId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sales rep</label>
          <select
            value={repId}
            onChange={(e) => setRepId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          >
            {reps.length === 0 && <option value="">Add a rep first</option>}
            {reps.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      )}

      <Input
        id="company_name"
        label="Title company *"
        placeholder="Acme Title & Escrow"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        list="company-suggestions"
        required
      />
      <datalist id="company-suggestions">
        {companySuggestions.map((c) => <option key={c} value={c} />)}
      </datalist>

      <div className="grid grid-cols-2 gap-3">
        <Input id="landed_at" name="landed_at" type="date" label="Landed on" />
        <Input id="notes" name="notes" label="Notes" placeholder="Optional" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" loading={loading} disabled={reps.length === 0}>Assign Account</Button>
      <p className="text-xs text-gray-400">
        Signings are matched to this account by company name (case-insensitive). Use the exact name your orders come in under.
      </p>
    </form>
  )
}
