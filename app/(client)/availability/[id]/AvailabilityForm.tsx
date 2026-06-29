'use client'

import { useState } from 'react'
import { CheckCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

// The four coarse windows captured at apply — kept identical so the data model
// stays consistent across apply / coverage / dispatch.
const WINDOWS: { val: string; label: string; hint: string }[] = [
  { val: 'weekday_day', label: 'Weekdays — daytime', hint: 'Mon–Fri, roughly 9am–5pm' },
  { val: 'weekday_evening', label: 'Weekday evenings', hint: 'Mon–Fri, after 5pm' },
  { val: 'weekends', label: 'Weekends', hint: 'Saturday & Sunday' },
  { val: 'same_day', label: 'Same-day / last-minute', hint: 'OK with short-notice jobs' },
]

export default function AvailabilityForm({ notaryId, firstName, current }: {
  notaryId: string
  firstName: string
  current: string[]
}) {
  const [selected, setSelected] = useState<string[]>(current)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(val: string) {
    setSelected((p) => p.includes(val) ? p.filter((x) => x !== val) : [...p, val])
  }

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/notaries/${notaryId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: selected }),
      })
      if (!res.ok) { setError('Something went wrong saving that. Please try again, or email support@inksent.co.'); return }
      setDone(true)
    } catch {
      setError('Couldn\'t reach us — please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
        <div className="bg-green-50 rounded-full p-5"><CheckCircle className="text-green-500 w-12 h-12" /></div>
        <h2 className="text-2xl font-bold text-gray-900">Got it — thank you, {firstName}!</h2>
        <p className="text-gray-500 max-w-sm">
          {selected.length > 0
            ? 'Your availability is saved. We’ll use it to match you to signings in your area.'
            : 'Saved. You haven’t marked any windows yet — tap “Update” below whenever you’re ready so we can start sending you jobs.'}
        </p>
        <button onClick={() => setDone(false)} className="text-sm text-violet-600 font-semibold hover:underline">
          Update my availability →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {WINDOWS.map((w) => {
          const on = selected.includes(w.val)
          return (
            <button key={w.val} type="button" onClick={() => toggle(w.val)}
              className={`w-full flex items-center gap-3 text-left rounded-xl border-2 px-4 py-3.5 transition-colors ${on ? 'border-violet-600 bg-violet-50' : 'border-gray-200 bg-white hover:border-violet-300'}`}>
              <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${on ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`}>
                {on && <Check size={15} className="text-white" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block text-sm font-semibold ${on ? 'text-violet-900' : 'text-gray-900'}`}>{w.label}</span>
                <span className="block text-xs text-gray-400">{w.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <Button onClick={save} size="lg" loading={saving} className="w-full">
        {saving ? 'Saving...' : 'Save My Availability'}
      </Button>
      <p className="text-center text-xs text-gray-400">No login needed. Tap as many as apply — or none if you’re pausing for now.</p>
    </div>
  )
}
