'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import {
  LayoutDashboard,
  Briefcase,
  Wallet,
  Car,
  Landmark,
  CalendarClock,
  Download,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { formatCurrency, STATUS_LABELS, STATUS_COLORS, cn } from '@/lib/utils'
import type { HubMetrics, EnrichedOrder } from '@/lib/notary-metrics'
import { StatCard, BarChart, DonutChart } from './charts'

type Tab = 'overview' | 'jobs' | 'paid' | 'mileage'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
  { id: 'paid', label: 'Get Paid', icon: <Wallet size={16} /> },
  { id: 'mileage', label: 'Mileage & Tax', icon: <Car size={16} /> },
]

function timeLabel(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
const dollars = (cents: number) => (cents / 100).toFixed(2)
const fmtMiles = (m: number | null) => (m === null ? '—' : `${m.toFixed(1)} mi`)

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? '')
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(',')
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function StatusChip({ status }: { status: string }) {
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold', STATUS_COLORS[status])}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export default function NotaryHub({
  notaryId,
  payoutsEnabled,
  baseZip,
  mileageRate,
  metrics,
  editable = false,
  showPayoutConnect = false,
}: {
  notaryId: string
  payoutsEnabled: boolean
  baseZip: string | null
  mileageRate: number
  metrics: HubMetrics
  /** Subscriber mode — can add/delete their own manually-entered jobs. */
  editable?: boolean
  /** Show the Inksent "connect your bank" payout CTA (roster agents only). */
  showPayoutConnect?: boolean
}) {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <>
      {/* Tab nav */}
      <div className="sticky top-0 z-20 -mx-4 px-4 bg-gray-50/90 backdrop-blur border-b border-gray-100 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors',
                tab === t.id
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <Overview metrics={metrics} notaryId={notaryId} editable={editable} onAddJob={() => setTab('jobs')} />}
      {tab === 'jobs' && <Jobs metrics={metrics} editable={editable} />}
      {tab === 'paid' && <GetPaid metrics={metrics} showPayoutConnect={showPayoutConnect} notaryId={notaryId} />}
      {tab === 'mileage' && <Mileage metrics={metrics} baseZip={baseZip} mileageRate={mileageRate} />}
    </>
  )
}

/* ----------------------------- Overview ----------------------------- */

function Overview({
  metrics,
  notaryId,
  editable,
  onAddJob,
}: {
  metrics: HubMetrics
  notaryId: string
  editable: boolean
  onAddJob: () => void
}) {
  return (
    <div className="space-y-6">
      {editable && metrics.jobs.length === 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Add your first signing</p>
            <p className="text-xs text-gray-500">Log your jobs and we&apos;ll build your earnings, payment, and mileage reports automatically.</p>
          </div>
          <button onClick={onAddJob} className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
            <Plus size={15} /> Add job
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This month" value={formatCurrency(metrics.mtdEarningsCents)} sub={`${metrics.jobsThisMonth} signings`} accent="violet" icon={<TrendingUp size={16} />} />
        <StatCard label="Year to date" value={formatCurrency(metrics.ytdEarningsCents)} sub="Gross earnings" accent="sky" icon={<Wallet size={16} />} />
        <StatCard label="Pending payout" value={formatCurrency(metrics.pendingPayoutCents)} sub="Owed to you" accent="amber" icon={<Clock size={16} />} />
        <StatCard label="Completed" value={String(metrics.completedCount)} sub={`Avg ${formatCurrency(metrics.avgFeeCents)}/job`} accent="green" icon={<CheckCircle2 size={16} />} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card title="Earnings — last 6 months">
            <BarChart
              data={metrics.monthly.map((m) => ({ label: m.label, value: m.earningsCents, hint: `${m.jobs} jobs` }))}
              formatValue={formatCurrency}
            />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Signing mix">
            <DonutChart
              data={metrics.typeMix.map((t) => ({ label: t.label, value: t.count, color: t.color }))}
              centerLabel="jobs"
              centerValue={String(metrics.completedCount)}
            />
          </Card>
        </div>
      </div>

      <Card title="Upcoming signings">
        {metrics.upcoming.length === 0 ? (
          <p className="py-6 text-center text-gray-400 text-sm">
            No upcoming signings right now. We&apos;ll text you when a job opens in your area.
          </p>
        ) : (
          <div className="divide-y divide-gray-50 -my-1">
            {metrics.upcoming.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{o.signer_name}</p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(o.signing_date), 'EEE, MMM d')} at {timeLabel(o.signing_time)} · {o.property_city},{' '}
                    {o.property_state}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-violet-700">{formatCurrency(o.notary_fee ?? 0)}</p>
                  <a href={`/complete/${o.id}?notary=${notaryId}`} className="text-xs text-violet-600 hover:underline">
                    Manage →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ------------------------------- Jobs ------------------------------- */

function Jobs({ metrics }: { metrics: HubMetrics }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return metrics.jobs.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (!needle) return true
      return [o.signer_name, o.property_city, o.property_state, o.confirmation_number]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle))
    })
  }, [metrics.jobs, q, status])

  return (
    <Card>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search signer, city, confirmation…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        >
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="font-semibold px-5 py-2">Date</th>
              <th className="font-semibold px-2 py-2">Signer</th>
              <th className="font-semibold px-2 py-2">Location</th>
              <th className="font-semibold px-2 py-2">Status</th>
              <th className="font-semibold px-2 py-2 text-right">Fee</th>
              <th className="font-semibold px-5 py-2 text-right">Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                  No jobs match.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 whitespace-nowrap text-gray-600">
                    {format(parseISO(o.signing_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-2 py-3 font-medium text-gray-900 whitespace-nowrap">{o.signer_name}</td>
                  <td className="px-2 py-3 text-gray-500 whitespace-nowrap">
                    {o.property_city}, {o.property_state}
                  </td>
                  <td className="px-2 py-3">
                    <StatusChip status={o.status} />
                  </td>
                  <td className="px-2 py-3 text-right font-semibold text-gray-900 tabular-nums">
                    {formatCurrency(o.notary_fee ?? 0)}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {o.status === 'completed' ? (
                      <span className={cn('text-[11px] font-semibold', o.notary_paid_at ? 'text-emerald-600' : 'text-amber-600')}>
                        {o.notary_paid_at ? 'Paid' : 'Pending'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ----------------------------- Get Paid ----------------------------- */

function GetPaid({
  metrics,
  payoutsEnabled,
  notaryId,
}: {
  metrics: HubMetrics
  payoutsEnabled: boolean
  notaryId: string
}) {
  return (
    <div className="space-y-6">
      {!payoutsEnabled && (
        <a
          href={`/onboard/${notaryId}/connect`}
          className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 hover:bg-violet-100 transition-colors"
        >
          <Landmark className="text-violet-600 w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Connect your bank to get paid</p>
            <p className="text-xs text-gray-500">2 minutes, deposit-only. Your completed-signing pay is waiting.</p>
          </div>
        </a>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Pending payout" value={formatCurrency(metrics.pendingPayoutCents)} sub={`${metrics.unpaid.length} jobs`} accent="amber" icon={<Clock size={16} />} />
        <StatCard label="Paid out" value={formatCurrency(metrics.paidOutCents)} sub="Lifetime" accent="green" icon={<CheckCircle2 size={16} />} />
        <StatCard label="Lifetime earnings" value={formatCurrency(metrics.lifetimeEarningsCents)} sub="All completed" accent="violet" icon={<Wallet size={16} />} />
      </div>

      <Card title="Receivables aging">
        {metrics.pendingPayoutCents === 0 ? (
          <p className="py-6 text-center text-emerald-600 text-sm font-medium">🎉 You&apos;re all paid up — nothing outstanding.</p>
        ) : (
          <BarChart
            data={metrics.aging.map((a) => ({ label: a.bucket, value: a.cents, hint: `${a.count} jobs` }))}
            formatValue={formatCurrency}
            barClassName="bg-gradient-to-t from-amber-400 to-amber-300"
            height={120}
          />
        )}
      </Card>

      <Card title={`Awaiting payment (${metrics.unpaid.length})`}>
        {metrics.unpaid.length === 0 ? (
          <p className="py-6 text-center text-gray-400 text-sm">Nothing outstanding.</p>
        ) : (
          <div className="divide-y divide-gray-50 -my-1">
            {metrics.unpaid.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{o.signer_name}</p>
                  <p className="text-xs text-gray-400">
                    {format(parseISO(o.completed_at ?? o.signing_date), 'MMM d, yyyy')} · {o.confirmation_number}
                  </p>
                </div>
                <p className="font-bold text-amber-600 shrink-0">{formatCurrency(o.notary_fee ?? 0)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------------------------- Mileage & Tax ---------------------------- */

function Mileage({
  metrics,
  baseZip,
  mileageRate,
}: {
  metrics: HubMetrics
  baseZip: string | null
  mileageRate: number
}) {
  const hasBaseZip = !!baseZip
  const withMiles = metrics.jobs.filter((o) => o.status === 'completed')

  const exportMileage = () => {
    const rows: (string | number)[][] = [
      ['Date', 'Confirmation', 'From (base ZIP)', 'To', 'Est. round-trip miles', 'Rate ($/mi)', 'Est. deduction ($)'],
      ...withMiles.map((o: EnrichedOrder) => [
        format(parseISO(o.completed_at ?? o.signing_date), 'yyyy-MM-dd'),
        o.confirmation_number ?? '',
        baseZip ?? '',
        `${o.property_city}, ${o.property_state} ${o.property_zip}`,
        o.miles ?? '',
        (mileageRate / 100).toFixed(3),
        o.deductionCents !== null ? dollars(o.deductionCents) : '',
      ]),
    ]
    downloadCsv('inksent-mileage-log.csv', rows)
  }

  const exportIncome = () => {
    const rows: (string | number)[][] = [
      ['Date', 'Confirmation', 'Signer', 'City', 'State', 'Type', 'Status', 'Fee ($)', 'Paid'],
      ...metrics.jobs.map((o) => [
        format(parseISO(o.completed_at ?? o.signing_date), 'yyyy-MM-dd'),
        o.confirmation_number ?? '',
        o.signer_name,
        o.property_city,
        o.property_state,
        o.signing_type,
        o.status,
        dollars(o.notary_fee ?? 0),
        o.notary_paid_at ? 'yes' : 'no',
      ]),
    ]
    downloadCsv('inksent-income.csv', rows)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="YTD miles" value={metrics.ytdMiles.toFixed(0)} sub="Estimated, round-trip" accent="sky" icon={<Car size={16} />} />
        <StatCard label="YTD deduction" value={formatCurrency(metrics.ytdDeductionCents)} sub={`@ ${mileageRate}¢/mi`} accent="green" icon={<TrendingUp size={16} />} />
        <StatCard label="Lifetime miles" value={metrics.lifetimeMiles.toFixed(0)} sub={formatCurrency(metrics.lifetimeDeductionCents)} accent="violet" icon={<CalendarClock size={16} />} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-xs text-amber-800 leading-relaxed">
        <strong>Estimates for convenience.</strong> Mileage is calculated as a round trip between your base ZIP and each
        property&apos;s ZIP — handy for a quick deduction snapshot, but it isn&apos;t a substitute for a contemporaneous
        odometer log. Verify figures with your tax professional before filing.
        {!hasBaseZip && (
          <span className="block mt-1 font-semibold">
            Add your base ZIP in your profile to enable mileage estimates.
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportMileage}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Download size={15} /> Mileage log (CSV)
        </button>
        <button
          onClick={exportIncome}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={15} /> Income report (CSV)
        </button>
      </div>

      <Card title="Mileage by signing">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="font-semibold px-5 py-2">Date</th>
                <th className="font-semibold px-2 py-2">Destination</th>
                <th className="font-semibold px-2 py-2 text-right">Round-trip</th>
                <th className="font-semibold px-5 py-2 text-right">Deduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {withMiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                    No completed jobs yet.
                  </td>
                </tr>
              ) : (
                withMiles.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 whitespace-nowrap text-gray-600">
                      {format(parseISO(o.completed_at ?? o.signing_date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-2 py-3 text-gray-700 whitespace-nowrap">
                      {o.property_city}, {o.property_state} {o.property_zip}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums text-gray-700">{fmtMiles(o.miles)}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-gray-900">
                      {o.deductionCents !== null ? formatCurrency(o.deductionCents) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
