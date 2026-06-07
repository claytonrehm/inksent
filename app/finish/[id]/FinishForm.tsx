'use client'

import { useState } from 'react'

const TYPES: [string, string][] = [
  ['purchase', 'Purchase'],
  ['refinance', 'Refinance'],
  ['heloc', 'HELOC'],
  ['reverse_mortgage', 'Reverse Mortgage'],
  ['loan_mod', 'Loan Modification'],
]

export default function FinishForm({ notaryId, notaryName, already }: { notaryId: string; notaryName: string; already: boolean }) {
  const [exp, setExp] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [done, setDone] = useState(already)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(t: string) {
    setTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])
  }

  async function submit() {
    if (!exp) { setError('Please select your experience level.'); return }
    setLoading(true); setError(null)
    const res = await fetch(`/api/notaries/${notaryId}/experience`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ re_experience: exp, signing_types: types }),
    })
    setLoading(false)
    if (!res.ok) { setError('Something went wrong. Please try again.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you{notaryName ? `, ${notaryName.split(' ')[0]}` : ''}!</h2>
        <p className="text-gray-500 text-sm">Your application is complete. We&apos;ll be in touch soon.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full">
      <h1 className="text-xl font-black text-gray-900 mb-1">One quick question{notaryName ? `, ${notaryName.split(' ')[0]}` : ''}</h1>
      <p className="text-gray-500 text-sm mb-6">This helps us match you to the right signings. Takes 20 seconds.</p>

      <label className="block text-sm font-medium text-gray-700 mb-1">How experienced are you with real-estate loan signings (purchases &amp; refinances)? *</label>
      <select value={exp} onChange={(e) => setExp(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mb-5">
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

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <button onClick={submit} disabled={loading}
        className="w-full bg-violet-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-violet-500 transition-colors disabled:opacity-50">
        {loading ? 'Saving...' : 'Submit'}
      </button>
    </div>
  )
}
