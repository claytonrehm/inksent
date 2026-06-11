import { createClient } from '@/lib/supabase/server'
import AddNotaryForm from './AddNotaryForm'
import NotaryActions from './NotaryActions'
import ApplicantsBoard, { type Applicant } from './ApplicantsBoard'
import CredentialBadges from '@/components/CredentialBadges'
import RequestCredentialsButton from './RequestCredentialsButton'
import { computePriority } from '@/lib/priority'
import { formatCurrency } from '@/lib/utils'
import { lookupZip } from '@/lib/coverage'
import { AlertCircle, Star, Users, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function coverageLabel(baseZip?: string | null): string | undefined {
  if (!baseZip) return undefined
  const info = lookupZip(baseZip)
  return info ? `${info.city}, ${info.state}` : baseZip
}

export default async function NotariesPage() {
  const supabase = await createClient()

  const [{ data: notaries }, { data: orders }, { data: ratings }] = await Promise.all([
    supabase.from('notaries').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('notary_id, notary_fee, notary_paid_at, status').eq('status', 'completed').not('notary_id', 'is', null),
    supabase.from('notary_ratings').select('notary_id, rating, on_time, professional'),
  ])

  const pending = (notaries ?? []).filter(n => !n.active && !n.denied_at)
  const denied = (notaries ?? []).filter(n => !!n.denied_at)
  const active = (notaries ?? []).filter(n => n.active).sort((a, b) => a.name.localeCompare(b.name))

  // Financial + job stats
  const stats: Record<string, { unpaid: number; ytd: number; count: number }> = {}
  for (const o of orders ?? []) {
    if (!o.notary_id) continue
    if (!stats[o.notary_id]) stats[o.notary_id] = { unpaid: 0, ytd: 0, count: 0 }
    stats[o.notary_id].count++
    stats[o.notary_id].ytd += o.notary_fee
    if (!o.notary_paid_at) stats[o.notary_id].unpaid += o.notary_fee
  }
  const totalUnpaid = Object.values(stats).reduce((s, n) => s + n.unpaid, 0)

  // Rating stats: avg, on-time %, concerns
  const rstat: Record<string, { sum: number; n: number; onTime: number; concerns: number }> = {}
  for (const r of ratings ?? []) {
    if (!r.notary_id) continue
    if (!rstat[r.notary_id]) rstat[r.notary_id] = { sum: 0, n: 0, onTime: 0, concerns: 0 }
    const s = rstat[r.notary_id]
    if (r.rating) { s.sum += r.rating; s.n++ }
    if (r.on_time) s.onTime++
    if ((r.rating && r.rating <= 2) || r.on_time === false || r.professional === false) s.concerns++
  }

  // Priority/reliability score per active notary, then rank the bench by it.
  // Everyone is still blasted at dispatch — this only orders the display (v0).
  const priorityOf: Record<string, ReturnType<typeof computePriority>> = {}
  for (const n of active) {
    const rs = rstat[n.id]
    priorityOf[n.id] = computePriority({
      ...n,
      jobsCompleted: stats[n.id]?.count ?? 0,
      onTimePct: rs && rs.n ? Math.round((rs.onTime / rs.n) * 100) : null,
      timesCancelled: n.times_cancelled,
    })
  }
  const activeRanked = [...active].sort((a, b) =>
    (priorityOf[b.id].score - priorityOf[a.id].score) || a.name.localeCompare(b.name)
  )

  // Map notary rows → Applicant shape for the board
  const toApplicant = (n: (typeof pending)[number]): Applicant => {
    const info = n.base_zip ? lookupZip(n.base_zip) : null
    return {
      id: n.id, name: n.name, email: n.email, phone: n.phone,
      photo_url: n.photo_url, base_zip: n.base_zip, coverage_radius: n.coverage_radius,
      coverage_label: info ? `${info.city}, ${info.state}` : n.base_zip ?? undefined,
      lat: info?.latitude, lng: info?.longitude,
      years_experience: n.years_experience, signings_completed: n.signings_completed,
      re_experience: n.re_experience, signing_types: n.signing_types,
      nna_certified: !!n.nna_certified, background_checked: !!n.background_checked,
      notes: n.notes, created_at: n.created_at, denied_at: n.denied_at,
    }
  }
  const applicants: Applicant[] = pending.map(toApplicant)
  const deniedApplicants: Applicant[] = denied.map(toApplicant)

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notary Network</h1>
          <p className="text-gray-500 text-sm mt-1">{active.length} on bench · {pending.length} awaiting review</p>
        </div>
        {totalUnpaid > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2 rounded-xl">
            <AlertCircle size={15} /> {formatCurrency(totalUnpaid)} unpaid
          </div>
        )}
      </div>

      {/* Applicants */}
      <section>
        <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <ClipboardList size={14} /> Applicants to Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No pending applications. Share <span className="font-mono text-violet-600">inksent.co/apply</span> to start receiving them.
          </div>
        ) : (
          <ApplicantsBoard applicants={applicants} />
        )}
      </section>

      {/* Active bench */}
      <section>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Users size={14} /> Active Bench ({active.length})
          </h2>
          <RequestCredentialsButton />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Agent</th>
                <th className="px-4 py-3 text-left">Coverage</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-right">On-time</th>
                <th className="px-4 py-3 text-right">Jobs</th>
                <th className="px-4 py-3 text-right">Concerns</th>
                <th className="px-4 py-3 text-right">Owed</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {active.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No active notaries yet — approve an applicant above</td></tr>
              ) : activeRanked.map((n) => {
                const s = stats[n.id]
                const rs = rstat[n.id]
                const avg = rs && rs.n ? rs.sum / rs.n : null
                const onTimePct = rs && rs.n ? Math.round((rs.onTime / rs.n) * 100) : null
                const prio = priorityOf[n.id]
                return (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/notaries/${n.id}`} className="flex items-center gap-3 group">
                        {n.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={n.photo_url} alt={n.name} className="rounded-full object-cover shrink-0 border border-gray-200" style={{ width: 36, height: 36 }} />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
                            {n.name.split(' ').map((w: string) => w[0]).join('').slice(0,2)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 text-sm whitespace-nowrap group-hover:text-violet-600 flex items-center gap-1.5">
                            {prio?.preferred && <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />}
                            {n.name}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${prio?.tier === 'A' ? 'bg-green-100 text-green-700' : prio?.tier === 'B' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-400'}`} title={`Priority score ${prio?.score ?? 0}/100`}>
                              {prio?.tier ?? '—'} {prio?.score ?? ''}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">{n.phone}</div>
                        </div>
                      </Link>
                      <div className="mt-1.5"><CredentialBadges notary={n} /></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{coverageLabel(n.base_zip) ?? '—'}</div>
                      <div className="text-xs text-gray-400">{n.base_zip ? `${n.base_zip} · ${n.coverage_radius ?? 25}mi` : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {avg ? <span className="inline-flex items-center gap-1 text-gray-700 font-medium"><Star size={12} className="text-amber-400 fill-amber-400" />{avg.toFixed(1)}</span> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {onTimePct != null ? <span className={onTimePct >= 90 ? 'text-green-600' : onTimePct >= 70 ? 'text-amber-600' : 'text-red-600'}>{onTimePct}%</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{s?.count ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      {rs && rs.concerns > 0 ? <span className="text-red-600 font-semibold">{rs.concerns}</span> : <span className="text-gray-300">0</span>}
                      {(n.times_cancelled ?? 0) > 0 && <div className="text-xs text-red-500 font-medium">{n.times_cancelled} cancelled</div>}
                      {(n.times_declined ?? 0) > 0 && <div className="text-xs text-gray-400">{n.times_declined} declined</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(s?.unpaid ?? 0) > 0 ? <span className="text-red-600 font-semibold">{formatCurrency(s.unpaid)}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end"><NotaryActions notaryId={n.id} active={true} /></div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">Click any agent to see full performance + reviews. &ldquo;Concerns&rdquo; counts low ratings, lateness, or unprofessional flags.</p>
      </section>

      {/* Denied applications (retained for future) */}
      {denied.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <ClipboardList size={14} /> Denied Apps ({denied.length})
          </h2>
          <p className="text-xs text-gray-400 mb-3">Kept on file for when you expand. Restore to move back to review, or approve directly.</p>
          <ApplicantsBoard applicants={deniedApplicants} mode="denied" />
        </section>
      )}

      <div className="max-w-md">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Add Manually</h2>
        <AddNotaryForm />
      </div>
    </div>
  )
}
