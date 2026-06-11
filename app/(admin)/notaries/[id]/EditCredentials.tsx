'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'

type Creds = {
  nna_certified?: boolean | null
  nna_number?: string | null
  nna_cert_expiry?: string | null
  background_checked?: boolean | null
  bgc_provider?: string | null
  bgc_date?: string | null
  eo_carrier?: string | null
  eo_expiry?: string | null
  commission_state_code?: string | null
  commission_expiry?: string | null
}

export default function EditCredentials({ notaryId, current }: { notaryId: string; current: Creds }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState<Creds>({
    nna_certified: !!current.nna_certified,
    nna_number: current.nna_number ?? '',
    nna_cert_expiry: current.nna_cert_expiry ?? '',
    background_checked: !!current.background_checked,
    bgc_provider: current.bgc_provider ?? '',
    bgc_date: current.bgc_date ?? '',
    eo_carrier: current.eo_carrier ?? '',
    eo_expiry: current.eo_expiry ?? '',
    commission_state_code: current.commission_state_code ?? '',
    commission_expiry: current.commission_expiry ?? '',
  })

  function set<K extends keyof Creds>(k: K, v: Creds[K]) { setF((p) => ({ ...p, [k]: v })) }

  async function save() {
    setBusy(true); setError('')
    // Empty strings → null (date columns reject '').
    const clean = (v: unknown) => (v === '' ? null : v)
    const payload = {
      nna_certified: !!f.nna_certified,
      nna_number: clean(f.nna_number),
      nna_cert_expiry: clean(f.nna_cert_expiry),
      background_checked: !!f.background_checked,
      bgc_provider: clean(f.bgc_provider),
      bgc_date: clean(f.bgc_date),
      eo_carrier: clean(f.eo_carrier),
      eo_expiry: clean(f.eo_expiry),
      commission_state_code: clean(f.commission_state_code),
      commission_expiry: clean(f.commission_expiry),
    }
    const res = await fetch(`/api/notaries/${notaryId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    setBusy(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error || 'Could not save.'); return }
    setOpen(false); router.refresh()
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700">
        <Pencil size={13} /> Edit credentials &amp; dates
      </button>
    )
  }

  const input = 'w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
  const label = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
      <p className="text-sm font-semibold text-gray-900 mb-1">Edit credentials</p>
      <p className="text-xs text-gray-500 mb-4">Pull dates from the NNA directory (signingagent.com — search the agent&apos;s name) and enter them here. These drive the status badges + automated renewal reminders.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 col-span-2 sm:col-span-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!f.nna_certified} onChange={(e) => set('nna_certified', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-violet-600" /> NNA certified
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 ml-4">
            <input type="checkbox" checked={!!f.background_checked} onChange={(e) => set('background_checked', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-violet-600" /> Background checked
          </label>
        </div>
        <div><label className={label}>NNA Member #</label><input className={input} value={f.nna_number ?? ''} onChange={(e) => set('nna_number', e.target.value)} /></div>
        <div><label className={label}>NNA cert renews</label><input type="date" className={input} value={f.nna_cert_expiry ?? ''} onChange={(e) => set('nna_cert_expiry', e.target.value)} /></div>
        <div><label className={label}>Background check date</label><input type="date" className={input} value={f.bgc_date ?? ''} onChange={(e) => set('bgc_date', e.target.value)} /></div>
        <div><label className={label}>BG provider</label><input className={input} placeholder="NNA, Sterling…" value={f.bgc_provider ?? ''} onChange={(e) => set('bgc_provider', e.target.value)} /></div>
        <div><label className={label}>E&amp;O carrier</label><input className={input} value={f.eo_carrier ?? ''} onChange={(e) => set('eo_carrier', e.target.value)} /></div>
        <div><label className={label}>E&amp;O expires</label><input type="date" className={input} value={f.eo_expiry ?? ''} onChange={(e) => set('eo_expiry', e.target.value)} /></div>
        <div><label className={label}>Commission state</label><input className={input} placeholder="CA" value={f.commission_state_code ?? ''} onChange={(e) => set('commission_state_code', e.target.value)} /></div>
        <div><label className={label}>Commission expires</label><input type="date" className={input} value={f.commission_expiry ?? ''} onChange={(e) => set('commission_expiry', e.target.value)} /></div>
      </div>
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={save} disabled={busy} className="bg-violet-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-700 disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={() => setOpen(false)} disabled={busy} className="text-sm text-gray-500 hover:text-gray-800 px-2">Cancel</button>
      </div>
    </div>
  )
}
