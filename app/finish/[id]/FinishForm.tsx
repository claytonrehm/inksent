'use client'

import { useState } from 'react'

const TYPES: [string, string][] = [
  ['purchase', 'Purchase'],
  ['refinance', 'Refinance'],
  ['heloc', 'HELOC'],
  ['reverse_mortgage', 'Reverse Mortgage'],
  ['loan_mod', 'Loan Modification'],
]

export default function FinishForm({
  notaryId, notaryName, hasExperience, defaults,
}: {
  notaryId: string
  notaryName: string
  hasExperience: boolean
  defaults: { nna_cert_expiry?: string | null; bgc_date?: string | null }
}) {
  const [exp, setExp] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [nnaExpiry, setNnaExpiry] = useState(defaults.nna_cert_expiry ?? '')
  const [bgcDate, setBgcDate] = useState(defaults.bgc_date ?? '')
  const [bgcProvider, setBgcProvider] = useState('')
  const [eoCarrier, setEoCarrier] = useState('')
  const [eoAmount, setEoAmount] = useState('')
  const [eoExpiry, setEoExpiry] = useState('')
  const [commissionExpiry, setCommissionExpiry] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(t: string) {
    setTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])
  }

  async function submit() {
    if (!nnaExpiry) { setError('Please enter your NNA certification renewal date.'); return }
    if (!bgcDate) { setError('Please enter the date your background check was completed.'); return }
    if (!eoCarrier || !eoExpiry) { setError('Please enter your E&O insurance carrier and expiry date.'); return }
    if (!commissionExpiry) { setError('Please enter your notary commission expiry date.'); return }
    if (!hasExperience && !exp) { setError('Please select your experience level.'); return }
    setLoading(true); setError(null)
    const res = await fetch(`/api/notaries/${notaryId}/experience`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        re_experience: hasExperience ? undefined : exp,
        signing_types: types,
        nna_cert_expiry: nnaExpiry,
        bgc_date: bgcDate,
        bgc_provider: bgcProvider || undefined,
        eo_carrier: eoCarrier,
        eo_coverage_amount: eoAmount || undefined,
        eo_expiry: eoExpiry,
        commission_expiry: commissionExpiry,
      }),
    })
    setLoading(false)
    if (!res.ok) { setError('Something went wrong. Please try again.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-10 max-w-md w-full text-center">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you{notaryName ? `, ${notaryName.split(' ')[0]}` : ''}!</h2>
        <p className="text-gray-500 text-sm">Your details are on file. We&apos;ll be in touch soon.</p>
      </div>
    )
  }

  const input = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 max-w-md w-full">
      <h1 className="text-xl font-black text-gray-900 mb-1">A few details to finish up{notaryName ? `, ${notaryName.split(' ')[0]}` : ''}</h1>
      <p className="text-gray-500 text-sm mb-6">We keep your credentials current so you stay eligible for signings. Takes about a minute.</p>

      <label className="block text-sm font-medium text-gray-700 mb-1">NNA certification renewal date *</label>
      <p className="text-xs text-gray-400 mb-1">On your NNA / SigningAgent.com profile (when your certification renews).</p>
      <input type="date" value={nnaExpiry} onChange={(e) => setNnaExpiry(e.target.value)} className={`${input} mb-5`} />

      <label className="block text-sm font-medium text-gray-700 mb-1">Background check completed *</label>
      <input type="date" value={bgcDate} onChange={(e) => setBgcDate(e.target.value)} className={`${input} mb-3`} />
      <label className="block text-xs font-medium text-gray-600 mb-1">Who ran it? <span className="text-gray-400 font-normal">(optional)</span></label>
      <input type="text" value={bgcProvider} onChange={(e) => setBgcProvider(e.target.value)} placeholder="NNA, Sterling, etc." className={`${input} mb-5`} />

      <label className="block text-sm font-medium text-gray-700 mb-1">E&amp;O insurance carrier *</label>
      <input type="text" value={eoCarrier} onChange={(e) => setEoCarrier(e.target.value)} placeholder="NNA, Notary Shield, etc." className={`${input} mb-3`} />
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Coverage amount ($)</label>
          <input type="number" min="0" step="5000" value={eoAmount} onChange={(e) => setEoAmount(e.target.value)} placeholder="25000" className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">E&amp;O expires *</label>
          <input type="date" value={eoExpiry} onChange={(e) => setEoExpiry(e.target.value)} className={input} />
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">Notary commission expires *</label>
      <input type="date" value={commissionExpiry} onChange={(e) => setCommissionExpiry(e.target.value)} className={`${input} mb-5`} />

      {!hasExperience && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1">How experienced are you with real-estate loan signings? *</label>
          <select value={exp} onChange={(e) => setExp(e.target.value)} className={`${input} mb-5`}>
            <option value="">Select...</option>
            <option value="expert">Very experienced — I handle purchases &amp; refinances regularly</option>
            <option value="comfortable">Comfortable — I&apos;ve completed many full loan packages</option>
            <option value="some">Some experience — a handful of loan signings</option>
            <option value="new">New to loan signings</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">Which signings are you experienced with? <span className="text-gray-400 font-normal">(select all)</span></label>
          <div className="flex flex-wrap gap-2 mt-1 mb-6">
            {TYPES.map(([val, label]) => (
              <button key={val} type="button" onClick={() => toggle(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${types.includes(val) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-300 hover:border-violet-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <button onClick={submit} disabled={loading}
        className="w-full bg-violet-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-violet-500 transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Submit'}
      </button>
    </div>
  )
}
