import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { lookupZip } from '@/lib/coverage'
import { SIGNINGS_LABEL } from '@/lib/notary'
import NotaryDetailActions from './NotaryDetailActions'
import CoverageMap from '@/components/CoverageMap'
import BackLink from '@/components/BackLink'
import { Star, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NotaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: notary }, { data: orders }, { data: ratings }, { data: cancellations }] = await Promise.all([
    supabase.from('notaries').select('*').eq('id', id).single(),
    supabase.from('orders').select('id, confirmation_number, signing_date, signer_name, property_city, status, notary_fee, notary_paid_at').eq('notary_id', id).order('signing_date', { ascending: false }),
    supabase.from('notary_ratings').select('*').eq('notary_id', id).order('created_at', { ascending: false }),
    supabase.from('notary_cancellations').select('*').eq('notary_id', id).order('created_at', { ascending: false }),
  ])

  if (!notary) notFound()

  const allOrders = orders ?? []
  const allRatings = ratings ?? []
  const completed = allOrders.filter(o => o.status === 'completed')
  const ratedCount = allRatings.length
  const avg = ratedCount ? allRatings.reduce((s, r) => s + (r.rating || 0), 0) / ratedCount : null
  const onTimePct = ratedCount ? Math.round((allRatings.filter(r => r.on_time).length / ratedCount) * 100) : null
  const concerns = allRatings.filter(r => (r.rating && r.rating <= 2) || r.on_time === false || r.professional === false).length
  const ytd = completed.reduce((s, o) => s + o.notary_fee, 0)
  const owed = completed.filter(o => !o.notary_paid_at).reduce((s, o) => s + o.notary_fee, 0)
  const coverage = lookupZip(notary.base_zip)
  const AVAIL_LABELS: Record<string, string> = { weekday_day: 'Weekdays', weekday_evening: 'Weekday eves', weekends: 'Weekends', same_day: 'Same-day OK' }
  const avail = (notary.availability as string[] | null) ?? []

  // Credential-expiry protection
  const today = new Date().toISOString().slice(0, 10)
  const soon = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)
  const credAlerts: string[] = []
  if (notary.eo_expiry && notary.eo_expiry < today) credAlerts.push('E&O insurance EXPIRED')
  else if (notary.eo_expiry && notary.eo_expiry < soon) credAlerts.push('E&O expires within 30 days')
  if (notary.commission_expiry && notary.commission_expiry < today) credAlerts.push('Commission EXPIRED')
  else if (notary.commission_expiry && notary.commission_expiry < soon) credAlerts.push('Commission expires within 30 days')

  // order lookup for review context
  const orderById = Object.fromEntries(allOrders.map(o => [o.id, o]))

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <BackLink href="/notaries" label="Back to network" />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-wrap items-start gap-5">
          {notary.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={notary.photo_url} alt={notary.name} className="rounded-2xl object-cover border border-gray-200 shrink-0" style={{ width: 96, height: 96 }} />
          ) : (
            <div className="rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center text-2xl font-bold shrink-0" style={{ width: 96, height: 96 }}>
              {notary.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{notary.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${notary.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {notary.active ? 'Active' : 'Inactive'}
              </span>
              {notary.nna_certified && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">NNA</span>}
              {notary.background_checked && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">Bg ✓</span>}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-gray-500">
              <a href={`tel:${notary.phone}`} className="flex items-center gap-1.5 hover:text-violet-600"><Phone size={13} /> {notary.phone}</a>
              <a href={`mailto:${notary.email}`} className="flex items-center gap-1.5 hover:text-violet-600"><Mail size={13} /> {notary.email}</a>
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {coverage ? `${coverage.city}, ${coverage.state}` : notary.base_zip} · {notary.coverage_radius ?? 25} mi</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1 text-xs text-gray-400">
              <span>{notary.years_experience ?? '—'} yrs experience</span>
              <span>{SIGNINGS_LABEL[notary.signings_completed ?? ''] ?? '—'} signings done</span>
              <span>Joined {format(new Date(notary.created_at), 'MMM d, yyyy')}</span>
            </div>
            {avail.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-xs text-gray-400">Available:</span>
                {avail.map((a) => (
                  <span key={a} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">{AVAIL_LABELS[a] ?? a}</span>
                ))}
              </div>
            )}
          </div>
          <NotaryDetailActions id={notary.id} active={notary.active} name={notary.name} />
        </div>
        {notary.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <span className="text-xs text-gray-400">Application notes: </span>{notary.notes}
          </div>
        )}
      </div>

      {/* Onboarding / credentials */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Credentials &amp; Payment</h2>
          {notary.onboarded_at ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Onboarding complete</span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Onboarding pending</span>
          )}
        </div>
        {credAlerts.length > 0 && (
          <div className="mb-4 flex items-start gap-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5">
            <span className="shrink-0">⚠️</span>
            <span><strong>Credential alert:</strong> {credAlerts.join(' · ')}. This agent is automatically excluded from dispatch until it&apos;s renewed.</span>
          </div>
        )}
        {notary.onboarded_at ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
            <Detail label="NNA Number" value={notary.nna_number || '—'} />
            <Detail label="Commission" value={[notary.commission_state_code, notary.commission_expiry && `exp ${notary.commission_expiry}`].filter(Boolean).join(' · ') || '—'} />
            <Detail label="Background Check" value={[notary.bgc_provider, notary.bgc_date].filter(Boolean).join(' · ') || 'Not provided'} />
            <Detail label="E&O Carrier" value={[notary.eo_carrier, notary.eo_expiry && `exp ${notary.eo_expiry}`].filter(Boolean).join(' · ') || '—'} />
            <Detail label="Dual-Tray Printer" value={notary.has_dual_tray == null ? '—' : notary.has_dual_tray ? 'Yes' : 'No'} />
            <Detail label="Payout (Stripe)" value={notary.payouts_enabled ? '✓ Direct deposit connected' : notary.stripe_account_id ? 'Setup started — not finished' : 'Not connected yet'} />
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            This notary hasn&apos;t completed onboarding yet. They received a link on approval; you can resend it:{' '}
            <span className="font-mono text-violet-600 text-xs">inksent.co/onboard/{notary.id}</span>
          </p>
        )}
      </div>

      {/* Coverage map */}
      {coverage && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Coverage Area</h2>
          <p className="text-sm text-gray-500 mb-3">{coverage.city}, {coverage.state} · covers ~{notary.coverage_radius ?? 25} miles</p>
          <CoverageMap lat={coverage.latitude} lng={coverage.longitude} radiusMiles={notary.coverage_radius ?? 25} label={notary.name} />
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Metric label="Jobs Done" value={String(completed.length)} />
        <Metric label="Rating" value={avg ? avg.toFixed(1) : '—'} star={!!avg} />
        <Metric label="On-Time" value={onTimePct != null ? `${onTimePct}%` : '—'} tone={onTimePct == null ? undefined : onTimePct >= 90 ? 'good' : onTimePct >= 70 ? 'warn' : 'bad'} />
        <Metric label="Cancellations" value={String(notary.times_cancelled ?? 0)} tone={(notary.times_cancelled ?? 0) > 0 ? 'bad' : 'good'} />
        <Metric label="Concerns" value={String(concerns)} tone={concerns > 0 ? 'bad' : 'good'} />
        <Metric label="Owed" value={formatCurrency(owed)} tone={owed > 0 ? 'warn' : undefined} />
      </div>

      {/* Cancellation history */}
      {(cancellations ?? []).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">Cancellations ({cancellations!.length})</h2>
          <div className="bg-white rounded-xl border border-red-200 shadow-sm divide-y divide-gray-100">
            {cancellations!.map((c) => {
              const lastMinute = c.hours_before_signing != null && c.hours_before_signing < 24
              return (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-900">{c.signer_name || c.confirmation_number}</p>
                    <p className="text-xs text-gray-400">{format(new Date(c.created_at), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                  {c.hours_before_signing != null && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${lastMinute ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {c.hours_before_signing < 0
                        ? 'after signing time'
                        : c.hours_before_signing < 24
                          ? `${c.hours_before_signing}h before`
                          : `${Math.round(c.hours_before_signing / 24)}d before`}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">Last-minute cancellations (under 24h) are the most damaging. Repeat offenders should be removed.</p>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Reviews ({ratedCount})</h2>
        {ratedCount === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No reviews yet. Rate this notary after each completed signing to build their track record.
          </div>
        ) : (
          <div className="space-y-3">
            {allRatings.map(r => {
              const o = orderById[r.order_id]
              return (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= (r.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}
                    </div>
                    {o && <span className="text-xs text-gray-400">{o.signer_name} · {format(new Date(o.signing_date), 'MMM d, yyyy')}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <Flag ok={r.on_time} label="On time" />
                    <Flag ok={r.docs_complete} label="Docs complete" />
                    <Flag ok={r.professional} label="Professional" />
                  </div>
                  {r.notes && <p className="text-sm text-gray-600 mt-2">{r.notes}</p>}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Job history */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Job History ({allOrders.length})</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Signer</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No jobs yet</td></tr>
              ) : allOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(new Date(o.signing_date), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-gray-900">{o.signer_name}</td>
                  <td className="px-4 py-3 text-gray-500">{o.property_city}</td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-600 capitalize">{o.status}</span></td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(o.notary_fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, star, tone }: { label: string; value: string; star?: boolean; tone?: 'good' | 'warn' | 'bad' }) {
  const color = tone === 'good' ? 'text-green-600' : tone === 'warn' ? 'text-amber-600' : tone === 'bad' ? 'text-red-600' : 'text-gray-900'
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold flex items-center gap-1 ${color}`}>
        {star && <Star size={15} className="text-amber-400 fill-amber-400" />}{value}
      </p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  )
}

function Flag({ ok, label }: { ok: boolean | null; label: string }) {
  if (ok == null) return null
  return (
    <span className={`flex items-center gap-1 text-xs ${ok ? 'text-green-600' : 'text-red-600'}`}>
      {ok ? <CheckCircle size={12} /> : <XCircle size={12} />} {label}
    </span>
  )
}
