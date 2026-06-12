'use client'

import { useState } from 'react'
import { MapPin, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

type Result = { found: boolean; city?: string; state?: string; agentCount?: number; covered?: boolean; sameDay?: boolean; weekends?: boolean; evenings?: boolean }

export default function CoverageCheck() {
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<Result | null>(null)

  async function check() {
    if (!/^\d{5}$/.test(zip)) { setRes({ found: false }); return }
    setLoading(true)
    try {
      const r = await fetch(`/api/coverage?zip=${zip}`)
      setRes(await r.json())
    } catch { setRes({ found: false }) }
    setLoading(false)
  }

  const windows = res?.covered ? [res.sameDay && 'Same-day', 'Weekdays', res.evenings && 'Evenings', res.weekends && 'Weekends'].filter(Boolean) : []

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
      <p className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-1.5"><MapPin size={15} className="text-violet-600" /> Check coverage for a closing</p>
      <p className="text-xs text-gray-500 mb-3">Enter a property ZIP to see who we can staff there right now.</p>
      <div className="flex gap-2">
        <input value={zip} maxLength={5} inputMode="numeric" placeholder="92101" aria-label="Property ZIP code"
          onChange={(e) => { setZip(e.target.value.replace(/\D/g, '')); setRes(null) }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <button type="button" onClick={check} disabled={loading}
          className="bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-violet-700 disabled:opacity-50">
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Check'}
        </button>
      </div>
      {res && (
        <div className="mt-3 text-sm">
          {!res.found ? (
            <p className="text-gray-500">Enter a valid 5-digit ZIP.</p>
          ) : res.covered ? (
            <div className="flex items-start gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span><strong>Covered in {res.city}, {res.state}</strong> — {res.agentCount} agent{res.agentCount === 1 ? '' : 's'} in range.{windows.length ? ` ${windows.join(' · ')}.` : ''}</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span><strong>{res.city}, {res.state} is a new area for us.</strong> We&apos;re expanding fast — submit it and we&apos;ll work to staff it, or we&apos;ll let you know quickly if we can&apos;t.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
