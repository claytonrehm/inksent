'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Search, ExternalLink, Phone, Mail, MapPin, ChevronDown, ChevronUp, Filter, RotateCcw, Trash2 } from 'lucide-react'
import { SIGNINGS_LABEL, SIGNINGS_RANK, vetApplicant } from '@/lib/notary'

export interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  photo_url?: string
  base_zip?: string
  coverage_radius?: number
  coverage_label?: string
  years_experience?: number
  signings_completed?: string
  nna_certified: boolean
  background_checked: boolean
  notes?: string
  created_at: string
  denied_at?: string
}

const TIER_STYLES: Record<string, string> = {
  Strong: 'bg-green-100 text-green-800 border-green-300',
  Solid: 'bg-violet-100 text-violet-800 border-violet-300',
  Review: 'bg-amber-100 text-amber-800 border-amber-300',
  Weak: 'bg-gray-100 text-gray-600 border-gray-300',
}

const VOL_FILTERS = [
  { value: '0', label: 'Any volume' },
  { value: '2', label: '50+ signings' },
  { value: '3', label: '200+ signings' },
  { value: '4', label: '500+ signings' },
]

export default function ApplicantsBoard({ applicants, mode = 'pending' }: { applicants: Applicant[]; mode?: 'pending' | 'denied' }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('all')
  const [minYears, setMinYears] = useState('0')
  const [minVol, setMinVol] = useState('0')
  const [nna, setNna] = useState('all')
  const [bgc, setBgc] = useState('all')
  const [sort, setSort] = useState('score')
  const [busy, setBusy] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  const cities = useMemo(() => {
    const s = new Set<string>()
    applicants.forEach(a => a.coverage_label && s.add(a.coverage_label))
    return Array.from(s).sort()
  }, [applicants])

  const filtered = useMemo(() => {
    let list = applicants.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      if (city !== 'all' && a.coverage_label !== city) return false
      if (minYears !== '0' && (a.years_experience ?? 0) < parseInt(minYears)) return false
      if (minVol !== '0' && (SIGNINGS_RANK[a.signings_completed ?? ''] ?? 0) < parseInt(minVol)) return false
      if (nna === 'yes' && !a.nna_certified) return false
      if (nna === 'no' && a.nna_certified) return false
      if (bgc === 'yes' && !a.background_checked) return false
      if (bgc === 'no' && a.background_checked) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'score') return vetApplicant(b).score - vetApplicant(a).score
      if (sort === 'experience') return (b.years_experience ?? 0) - (a.years_experience ?? 0)
      if (sort === 'signings') return (SIGNINGS_RANK[b.signings_completed ?? ''] ?? 0) - (SIGNINGS_RANK[a.signings_completed ?? ''] ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // newest
    })
    return list
  }, [applicants, search, city, minYears, minVol, nna, bgc, sort])

  const approve = (id: string) =>
    fetch(`/api/notaries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: true, denied_at: null }) })
  const deny = (id: string) =>
    fetch(`/api/notaries/${id}/deny`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
  const restore = (id: string) =>
    fetch(`/api/notaries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ denied_at: null }) })
  const remove = (id: string) => fetch(`/api/notaries/${id}`, { method: 'DELETE' })

  async function act(id: string, action: 'approve' | 'deny' | 'restore' | 'delete') {
    if (action === 'delete' && !confirm('Permanently delete this application? This cannot be undone.')) return
    setBusy(id)
    if (action === 'approve') await approve(id)
    else if (action === 'deny') await deny(id)
    else if (action === 'restore') await restore(id)
    else if (action === 'delete') await remove(id)
    setBusy(null)
    router.refresh()
  }

  async function bulk(action: 'approve' | 'deny' | 'delete') {
    if (selected.size === 0) return
    if (action === 'deny' && !confirm(`Deny ${selected.size} applicant(s)? They'll be notified and kept on file.`)) return
    if (action === 'delete' && !confirm(`Permanently delete ${selected.size} application(s)? This cannot be undone.`)) return
    setBusy('bulk')
    await Promise.all(Array.from(selected).map(id =>
      action === 'approve' ? approve(id) : action === 'deny' ? deny(id) : remove(id)
    ))
    setSelected(new Set())
    setBusy(null)
    router.refresh()
  }

  function toggleSel(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const reset = () => { setSearch(''); setCity('all'); setMinYears('0'); setMinVol('0'); setNna('all'); setBgc('all'); setSort('score') }
  const activeFilters = [city !== 'all', minYears !== '0', minVol !== '0', nna !== 'all', bgc !== 'all', !!search].filter(Boolean).length

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <Select value={city} onChange={setCity} options={[['all', 'All areas'], ...cities.map(c => [c, c] as [string, string])]} />
          <Select value={minYears} onChange={setMinYears} options={[['0', 'Any experience'], ['2', '2+ yrs'], ['5', '5+ yrs'], ['10', '10+ yrs']]} />
          <Select value={minVol} onChange={setMinVol} options={VOL_FILTERS.map(v => [v.value, v.label] as [string, string])} />
          <Select value={nna} onChange={setNna} options={[['all', 'NNA: any'], ['yes', 'NNA: yes'], ['no', 'NNA: no']]} />
          <Select value={bgc} onChange={setBgc} options={[['all', 'Bg check: any'], ['yes', 'Bg check: yes'], ['no', 'Bg check: no']]} />
          <Select value={sort} onChange={setSort} options={[['score', 'Sort: AI score'], ['experience', 'Sort: experience'], ['signings', 'Sort: signings'], ['newest', 'Sort: newest']]} />
          {activeFilters > 0 && (
            <button onClick={reset} className="text-xs text-violet-600 hover:underline flex items-center gap-1">
              <Filter size={12} /> Clear ({activeFilters})
            </button>
          )}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">{selected.size} selected</span>
            <button onClick={() => bulk('approve')} disabled={busy === 'bulk'}
              className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
              <CheckCircle size={13} /> Approve all
            </button>
            {mode === 'pending' ? (
              <button onClick={() => bulk('deny')} disabled={busy === 'bulk'}
                className="flex items-center gap-1.5 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                <XCircle size={13} /> Deny all
              </button>
            ) : (
              <button onClick={() => bulk('delete')} disabled={busy === 'bulk'}
                className="flex items-center gap-1.5 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50">
                <Trash2 size={13} /> Delete all
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:underline ml-auto">Clear selection</button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} of {applicants.length} applicants</p>

      {/* Applicant list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            No applicants match these filters
          </div>
        ) : filtered.map(a => {
          const vet = vetApplicant(a)
          return (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 flex items-start gap-4">
              <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSel(a.id)}
                className="mt-1 rounded text-violet-600 shrink-0" />
              {a.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.photo_url} alt={a.name} className="rounded-xl object-cover border border-gray-200 shrink-0" style={{ width: 60, height: 60 }} />
              ) : (
                <div className="rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold shrink-0" style={{ width: 60, height: 60 }}>
                  {a.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{a.name}</h3>
                  <span title={`Automated vetting score ${vet.score}/100`} className={`text-xs font-semibold border px-1.5 py-0.5 rounded ${TIER_STYLES[vet.tier]}`}>{vet.tier} · {vet.score}</span>
                  {a.nna_certified && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">NNA</span>}
                  {a.background_checked && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">Bg ✓</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {a.coverage_label ?? a.base_zip} · {a.coverage_radius ?? 25}mi</span>
                  <span>{a.years_experience ?? 0} yrs exp</span>
                  <span>{SIGNINGS_LABEL[a.signings_completed ?? ''] ?? '—'} signings</span>
                  {mode === 'denied' && a.denied_at && <span className="text-red-500">Denied {new Date(a.denied_at).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-400">
                  <a href={`tel:${a.phone}`} className="flex items-center gap-1 hover:text-violet-600"><Phone size={10} /> {a.phone}</a>
                  <a href={`mailto:${a.email}`} className="flex items-center gap-1 hover:text-violet-600 truncate"><Mail size={10} /> {a.email}</a>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => act(a.id, 'approve')} disabled={busy === a.id}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap">
                  <CheckCircle size={13} /> Approve
                </button>
                {mode === 'pending' ? (
                  <button onClick={() => act(a.id, 'deny')} disabled={busy === a.id}
                    className="flex items-center gap-1.5 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 whitespace-nowrap">
                    <XCircle size={13} /> Deny
                  </button>
                ) : (
                  <>
                    <button onClick={() => act(a.id, 'restore')} disabled={busy === a.id}
                      className="flex items-center gap-1.5 text-violet-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-violet-50 disabled:opacity-50 whitespace-nowrap">
                      <RotateCcw size={13} /> Restore
                    </button>
                    <button onClick={() => act(a.id, 'delete')} disabled={busy === a.id}
                      className="flex items-center gap-1.5 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-50 whitespace-nowrap">
                      <Trash2 size={13} /> Delete
                    </button>
                  </>
                )}
                <button onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  className="flex items-center gap-1 text-gray-400 text-xs px-3 py-1 hover:text-gray-600">
                  Vet {expanded === a.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              </div>
            </div>

            {/* Vetting detail */}
            {expanded === a.id && (
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {vet.pros.map(p => <span key={p} className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">✓ {p}</span>)}
                  {vet.cons.map(c => <span key={c} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">⚠ {c}</span>)}
                </div>
                {a.notes && <p className="text-sm text-gray-600 mb-3"><span className="text-xs text-gray-400">Notes: </span>{a.notes}</p>}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Verify online</p>
                <div className="flex flex-wrap gap-2">
                  <VetLink label="NNA Directory" href={`https://www.signingagent.com/find-a-signing-agent`} />
                  <VetLink label="Google reviews" href={`https://www.google.com/search?q=${encodeURIComponent(`"${a.name}" notary ${a.coverage_label ?? ''} reviews OR complaints`)}`} />
                  <VetLink label="BBB" href={`https://www.bbb.org/search?find_text=${encodeURIComponent(a.name)}`} />
                  <VetLink label="LinkedIn" href={`https://www.google.com/search?q=${encodeURIComponent(`${a.name} notary signing agent ${a.coverage_label ?? ''} site:linkedin.com`)}`} />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  The score is an automated first pass. Confirm NNA cert + background-check date on the directory, then scan for complaints. ~30 seconds.
                </p>
              </div>
            )}
          </div>
          )
        })}
      </div>
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function VetLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:border-violet-300 hover:text-violet-700 transition-colors">
      <ExternalLink size={11} /> {label}
    </a>
  )
}
