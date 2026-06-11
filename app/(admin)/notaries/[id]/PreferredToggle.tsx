'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

export default function PreferredToggle({ notaryId, initial }: { notaryId: string; initial: boolean }) {
  const router = useRouter()
  const [on, setOn] = useState(initial)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    const next = !on
    const res = await fetch(`/api/notaries/${notaryId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferred: next }),
    })
    setBusy(false)
    if (res.ok) { setOn(next); router.refresh() }
  }

  return (
    <button type="button" onClick={toggle} disabled={busy}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${on ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-amber-300'}`}>
      <Star size={14} className={on ? 'fill-amber-400 text-amber-400' : ''} /> {on ? 'Preferred' : 'Mark preferred'}
    </button>
  )
}
