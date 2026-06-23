'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SalesRepRow } from '@/lib/sales'

// Admin-managed onboarding checklist for a rep: signed agreement, W-9 on file,
// how to pay them, and a final "fully onboarded" flag.
export default function OnboardingChecklist({ rep }: { rep: SalesRepRow }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [agreement, setAgreement] = useState(!!rep.agreement_accepted_at)
  const [w9, setW9] = useState(!!rep.w9_received)
  const [onboarded, setOnboarded] = useState(!!rep.onboarded_at)

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setOk(false)
    const form = new FormData(e.currentTarget)
    const res = await fetch(`/api/admin/sales/reps/${rep.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agreement_accepted: agreement,
        w9_received: w9,
        onboarded,
        payment_method: form.get('payment_method'),
        payment_details: form.get('payment_details'),
      }),
    })
    setLoading(false)
    if (res.ok) { setOk(true); router.refresh() }
  }

  const steps = [
    { done: agreement, label: '1099 commission agreement signed', set: setAgreement },
    { done: w9, label: 'W-9 on file', set: setW9 },
    { done: !!rep.payment_method, label: 'Payment method set', readonly: true },
    { done: onboarded, label: 'Fully onboarded (ready to sell)', set: setOnboarded },
  ]
  const complete = steps.filter((s) => s.done).length

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="text-xs text-gray-400">{complete}/{steps.length} complete</div>

      <div className="space-y-2">
        {steps.map((s) => (
          <label key={s.label} className={`flex items-center gap-3 text-sm ${s.readonly ? 'text-gray-500' : 'text-gray-700 cursor-pointer'}`}>
            <input type="checkbox" checked={s.done} disabled={s.readonly}
              onChange={(e) => s.set?.(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 disabled:opacity-50" />
            {s.label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
          <select name="payment_method" defaultValue={rep.payment_method ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="">Not set</option>
            <option value="ACH">ACH / direct deposit</option>
            <option value="Zelle">Zelle</option>
            <option value="Check">Check</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>
        <Input id="payment_details" name="payment_details" label="Payment details" defaultValue={rep.payment_details ?? ''} placeholder="Zelle email/phone, etc." />
      </div>

      {ok && <p className="text-xs text-green-600">Saved.</p>}
      <Button type="submit" loading={loading}>Save Onboarding</Button>
      <p className="text-xs text-gray-400">Tip: collect the W-9 and signed agreement by email (don&apos;t store SSNs here). See <span className="font-mono">SALES-COMMISSION-AGREEMENT.md</span>.</p>
    </form>
  )
}
