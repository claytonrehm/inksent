'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Mail, Phone, ExternalLink, Search } from 'lucide-react'
import { scoreApplicant } from '@/lib/sales'
import ApplicantActions from './ApplicantActions'

/* eslint-disable @typescript-eslint/no-explicit-any */

const YEARS: Record<string, string> = { under_1: '<1 yr sales', '1_3': '1–3 yrs', '3_5': '3–5 yrs', '5_10': '5–10 yrs', '10_plus': '10+ yrs' }
const B2B: Record<string, string> = { extensive: 'Extensive B2B', some: 'Some B2B', none: 'Mostly B2C' }
const INDUSTRY: Record<string, string> = { current: 'In title/escrow/RE now', past: 'Past title/escrow/RE', none: 'No industry exp' }
const RELATIONSHIPS: Record<string, string> = { many: '★ Active rolodex', some: 'A few contacts', none: 'No contacts yet' }

export default function ApplicantsBoard({ apps }: { apps: any[] }) {
  const [status, setStatus] = useState('new')
  const [tier, setTier] = useState('all')
  const [industry, setIndustry] = useState('all')
  const [rel, setRel] = useState('all')
  const [b2b, setB2b] = useState('all')
  const [sort, setSort] = useState('fit')
  const [q, setQ] = useState('')

  const enriched = useMemo(() => apps.map((a) => ({ ...a, fit: scoreApplicant(a) })), [apps])

  const newApps = enriched.filter((a) => a.status === 'new')
  const metrics = {
    new: newApps.length,
    a: newApps.filter((a) => a.fit.tier === 'A').length,
    b: newApps.filter((a) => a.fit.tier === 'B').length,
    rolodex: newApps.filter((a) => a.title_relationships === 'many').length,
    inIndustry: newApps.filter((a) => a.industry_experience === 'current').length,
  }

  const filtered = useMemo(() => {
    let r = enriched
    if (status !== 'all') r = r.filter((a) => a.status === status)
    if (tier !== 'all') r = r.filter((a) => a.fit.tier === tier)
    if (industry !== 'all') r = r.filter((a) => (a.industry_experience ?? '') === industry)
    if (rel !== 'all') r = r.filter((a) => (a.title_relationships ?? '') === rel)
    if (b2b !== 'all') r = r.filter((a) => (a.b2b_experience ?? '') === b2b)
    if (q.trim()) {
      const s = q.toLowerCase()
      r = r.filter((a) => [a.name, a.location, a.pitch, a.email].some((v: string) => (v ?? '').toLowerCase().includes(s)))
    }
    return [...r].sort((a, b) =>
      sort === 'fit' ? b.fit.score - a.fit.score
        : sort === 'new' ? +new Date(b.created_at) - +new Date(a.created_at)
        : (a.name ?? '').localeCompare(b.name ?? '')
    )
  }, [enriched, status, tier, industry, rel, b2b, q, sort])

  return (
    <div className="space-y-5">
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Metric label="New" value={metrics.new} />
        <Metric label="A-tier" value={metrics.a} accent="green" />
        <Metric label="B-tier" value={metrics.b} accent="violet" />
        <Metric label="Active rolodex" value={metrics.rolodex} accent="violet" />
        <Metric label="In industry now" value={metrics.inIndustry} accent="violet" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, location, pitch…"
            className="pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 w-56" />
        </div>
        <Filter value={status} onChange={setStatus} opts={[['new', 'New'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All statuses']]} />
        <Filter value={tier} onChange={setTier} opts={[['all', 'All tiers'], ['A', 'A-tier'], ['B', 'B-tier'], ['C', 'C-tier']]} />
        <Filter value={rel} onChange={setRel} opts={[['all', 'Any relationships'], ['many', 'Active rolodex'], ['some', 'Some contacts'], ['none', 'No contacts']]} />
        <Filter value={industry} onChange={setIndustry} opts={[['all', 'Any industry exp'], ['current', 'In industry now'], ['past', 'Past industry'], ['none', 'No industry']]} />
        <Filter value={b2b} onChange={setB2b} opts={[['all', 'Any B2B'], ['extensive', 'Extensive B2B'], ['some', 'Some B2B'], ['none', 'Mostly B2C']]} />
        <div className="ml-auto flex items-center gap-1.5 text-sm text-gray-500">
          Sort
          <Filter value={sort} onChange={setSort} opts={[['fit', 'Best fit'], ['new', 'Newest'], ['name', 'Name']]} />
        </div>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} shown</p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No applicants match these filters.</div>
      ) : (
        <div className="space-y-3">{filtered.map((a) => <Card key={a.id} a={a} />)}</div>
      )}
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: number; accent?: 'green' | 'violet' }) {
  const color = accent === 'green' ? 'text-green-600' : accent === 'violet' ? 'text-violet-600' : 'text-gray-900'
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  )
}

function Filter({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="text-sm rounded-md border border-gray-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function Card({ a }: { a: any }) {
  const fit = a.fit ?? scoreApplicant(a)
  const tierColor = fit.tier === 'A' ? 'bg-green-100 text-green-700' : fit.tier === 'B' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${tierColor}`} title={`Fit score ${fit.score}/100`}>{fit.tier} · {fit.score}</span>
            {a.name}
            {a.status === 'approved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">approved</span>}
            {a.status === 'rejected' && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">rejected</span>}
          </h3>
          <p className="text-sm text-gray-600">{a.location || '—'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 hover:text-violet-600"><Mail size={13} /> {a.email}</a>
            <a href={`tel:${a.phone}`} className="flex items-center gap-1.5 hover:text-violet-600"><Phone size={13} /> {a.phone}</a>
            {a.linkedin_url && <a href={a.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-violet-600"><ExternalLink size={13} /> LinkedIn/résumé</a>}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">{format(new Date(a.created_at), 'MMM d, h:mm a')}</div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {a.years_sales && <Tag>{YEARS[a.years_sales] ?? a.years_sales}</Tag>}
        {a.b2b_experience && <Tag>{B2B[a.b2b_experience] ?? a.b2b_experience}</Tag>}
        {a.industry_experience && <Tag>{INDUSTRY[a.industry_experience] ?? a.industry_experience}</Tag>}
        {a.title_relationships && <Tag highlight={a.title_relationships === 'many'}>{RELATIONSHIPS[a.title_relationships] ?? a.title_relationships}</Tag>}
      </div>

      {a.pitch && <p className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{a.pitch}</p>}
      {a.heard_from && <p className="mt-2 text-xs text-gray-400">Heard from: {a.heard_from}</p>}

      {a.status === 'new' && <div className="mt-4 flex justify-end"><ApplicantActions id={a.id} /></div>}
    </div>
  )
}

function Tag({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return <span className={`px-2 py-0.5 rounded text-xs ${highlight ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>{children}</span>
}
