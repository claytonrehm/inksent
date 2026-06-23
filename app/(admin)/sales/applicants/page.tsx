import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Mail, Phone, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ApplicantActions from './ApplicantActions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sales Applicants — Inksent Admin' }

const YEARS: Record<string, string> = { under_1: '<1 yr sales', '1_3': '1–3 yrs', '3_5': '3–5 yrs', '5_10': '5–10 yrs', '10_plus': '10+ yrs' }
const B2B: Record<string, string> = { extensive: 'Extensive B2B', some: 'Some B2B', none: 'Mostly B2C' }
const INDUSTRY: Record<string, string> = { current: 'In title/escrow/RE now', past: 'Past title/escrow/RE', none: 'No industry exp' }
const RELATIONSHIPS: Record<string, string> = { many: '★ Active rolodex', some: 'A few contacts', none: 'No contacts yet' }

export default async function SalesApplicantsPage() {
  const supabase = await createClient()
  const { data: apps, error } = await supabase
    .from('sales_rep_applications')
    .select('*')
    .order('created_at', { ascending: false })

  const list = apps ?? []
  const pending = list.filter((a) => a.status === 'new')
  const reviewed = list.filter((a) => a.status !== 'new')

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600"><ArrowLeft size={15} /> Sales</Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Rep Applicants</h1>
        <p className="text-gray-500 text-sm mt-1">People who applied at <span className="font-mono text-violet-600">inksent.co/sales-apply</span>. Approve to create a rep with your standard terms.</p>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">Apply the <code>sales_rep_applications</code> migration to see applicants here.</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          No applications yet. Share <span className="font-mono text-violet-600">inksent.co/sales-apply</span> (and link it from your Indeed post).
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">New ({pending.length})</h2>
            {pending.length === 0 ? <p className="text-sm text-gray-400">Nothing waiting for review.</p> : pending.map((a) => <Card key={a.id} a={a} actionable />)}
          </section>

          {reviewed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Reviewed ({reviewed.length})</h2>
              {reviewed.map((a) => <Card key={a.id} a={a} />)}
            </section>
          )}
        </>
      )}
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function Card({ a, actionable }: { a: any; actionable?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900">{a.name}
            {a.status === 'approved' && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">approved</span>}
            {a.status === 'rejected' && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">rejected</span>}
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

      {actionable && <div className="mt-4 flex justify-end"><ApplicantActions id={a.id} /></div>}
    </div>
  )
}

function Tag({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return <span className={`px-2 py-0.5 rounded text-xs ${highlight ? 'bg-violet-100 text-violet-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>{children}</span>
}
