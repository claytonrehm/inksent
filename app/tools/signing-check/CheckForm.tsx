'use client'

import { useRef, useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react'

type Report = {
  summary: string
  riskLevel: 'low' | 'medium' | 'high'
  totals: { signatures: number; initials: number; dates: number; notarizations: number }
  locations: { page: number; who: string; action: string; document: string }[]
  issues: { severity: 'high' | 'medium' | 'low'; page: number | null; issue: string }[]
  recommendations: string[]
}

const RISK = {
  low: { label: 'Low risk', cls: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: 'Medium risk', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'High risk', cls: 'bg-red-50 text-red-700 border-red-200' },
}
const SEV = { high: 'text-red-600 bg-red-50 border-red-200', medium: 'text-amber-600 bg-amber-50 border-amber-200', low: 'text-gray-600 bg-gray-50 border-gray-200' }

export default function CheckForm() {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!file) { setError('Please attach the signing package PDF.'); return }
    setBusy(true)
    const fd = new FormData(e.currentTarget)
    fd.set('file', file)
    try {
      const res = await fetch('/api/signing-check', { method: 'POST', body: fd })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) { setError(j.error || 'Something went wrong. Please try again.'); setBusy(false); return }
      setReport(j.report)
    } catch {
      setError('We couldn\'t reach the analyzer. Check your connection and try again.')
    }
    setBusy(false)
  }

  if (report) {
    const r = RISK[report.riskLevel]
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-black text-gray-900">Your signing-package report</h2>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${r.cls}`}>{r.label}</span>
        </div>
        <p className="text-gray-600">{report.summary}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([['Signatures', report.totals.signatures], ['Initials', report.totals.initials], ['Dates', report.totals.dates], ['Notarizations', report.totals.notarizations]] as const).map(([label, n]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-violet-700">{n}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {report.issues.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> {report.issues.length} thing{report.issues.length > 1 ? 's' : ''} to check before you go</h3>
            <ul className="space-y-2">
              {report.issues.map((iss, i) => (
                <li key={i} className={`text-sm border rounded-lg px-3 py-2 ${SEV[iss.severity]}`}>
                  <span className="font-semibold uppercase text-[10px] tracking-wide">{iss.severity}</span>{iss.page ? ` · p.${iss.page}` : ''} — {iss.issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.recommendations.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> At the table</h3>
            <ul className="space-y-1.5 text-sm text-gray-700 list-disc pl-5">
              {report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </div>
        )}

        <details className="border border-gray-100 rounded-xl p-4">
          <summary className="font-bold text-gray-900 cursor-pointer">Every sign-here / notarize spot ({report.locations.length})</summary>
          <div className="mt-3 max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 uppercase tracking-wide text-left"><tr><th className="py-1.5 pr-3">Page</th><th className="py-1.5 pr-3">Who</th><th className="py-1.5 pr-3">Action</th><th className="py-1.5">Document</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {report.locations.map((l, i) => (
                  <tr key={i}><td className="py-1.5 pr-3 text-gray-500">{l.page}</td><td className="py-1.5 pr-3 text-gray-800">{l.who}</td><td className="py-1.5 pr-3"><span className="text-violet-700 font-medium">{l.action}</span></td><td className="py-1.5 text-gray-600">{l.document}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button onClick={() => { setReport(null); setFile(null) }} className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700">Check another package</button>
        </div>
        <p className="text-xs text-gray-400">This is an AI aid, not legal advice — always confirm at the table. We do not store your document.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sc-name" className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
          <input id="sc-name" name="name" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Jane Smith" />
        </div>
        <div>
          <label htmlFor="sc-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="sc-email" name="email" type="email" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="you@company.com" />
        </div>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? 'border-violet-300 bg-violet-50/40' : 'border-gray-300 hover:border-violet-400 bg-gray-50'}`}
      >
        <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setError('') } }} />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-violet-700 font-semibold"><FileText size={18} /> {file.name} <span className="text-gray-400 font-normal">({(file.size / 1024 / 1024).toFixed(1)}MB)</span></div>
        ) : (
          <div className="text-gray-500"><Upload size={22} className="mx-auto mb-2 text-gray-400" /><span className="font-semibold text-violet-600">Upload the signing package</span> (PDF, up to 4.5MB)</div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <button type="submit" disabled={busy} className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2">
        {busy ? <><Loader2 size={17} className="animate-spin" /> Analyzing your package…</> : <><ShieldCheck size={17} /> Check my package</>}
      </button>
      <p className="text-xs text-gray-400 text-center">Takes ~30–60 seconds. We analyze it and don&apos;t store it.</p>
    </form>
  )
}
