import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { lookupZip } from '@/lib/coverage'
import DownloadCsv from './DownloadCsv'

export const dynamic = 'force-dynamic'

const money = (cents: number) => (cents / 100).toFixed(2)

export default async function ReportsPage() {
  const supabase = await createClient()
  const [{ data: orders }, { data: notaries }, { data: cancellations }, { data: salesReps }, { data: salesPayouts }] = await Promise.all([
    supabase.from('orders').select('id, confirmation_number, status, signing_type, signing_date, signer_name, property_city, property_state, base_zip, client_company, client_email, client_fee, notary_fee, notary_id, created_at, dispatched_at, accepted_at, completed_at, client_paid_at, notary_paid_at, issue_reported_at, client_satisfaction'),
    supabase.from('notaries').select('id, name, email'),
    supabase.from('notary_cancellations').select('id'),
    supabase.from('sales_reps').select('id, name, email'),
    supabase.from('sales_payouts').select('sales_rep_id, amount_cents, paid_at, created_at'),
  ])

  const O = orders ?? []
  const nameById = Object.fromEntries((notaries ?? []).map((n) => [n.id, n.name]))
  const emailById = Object.fromEntries((notaries ?? []).map((n) => [n.id, n.email]))

  // ─── Overview ───────────────────────────────────────────
  const completed = O.filter((o) => o.status === 'completed')
  const collected = O.filter((o) => o.client_paid_at).reduce((s, o) => s + o.client_fee, 0)
  const billedCompleted = completed.reduce((s, o) => s + o.client_fee, 0)
  const outstanding = completed.filter((o) => !o.client_paid_at).reduce((s, o) => s + o.client_fee, 0)
  const paidOut = O.filter((o) => o.notary_paid_at).reduce((s, o) => s + o.notary_fee, 0)
  const owedOut = O.filter((o) => o.client_paid_at && !o.notary_paid_at && o.notary_id).reduce((s, o) => s + o.notary_fee, 0)
  const margin = collected - paidOut
  const confirmTimes = O.filter((o) => o.accepted_at && o.dispatched_at)
    .map((o) => (new Date(o.accepted_at!).getTime() - new Date(o.dispatched_at!).getTime()) / 60000)
  const avgConfirm = confirmTimes.length ? Math.round(confirmTimes.reduce((s, t) => s + t, 0) / confirmTimes.length) : null
  const issues = O.filter((o) => o.issue_reported_at).length
  const thumbsUp = O.filter((o) => o.client_satisfaction === 'up').length
  const thumbsDown = O.filter((o) => o.client_satisfaction === 'down').length
  const rated = thumbsUp + thumbsDown
  const satisfaction = rated ? Math.round((thumbsUp / rated) * 100) : null

  // ─── By title partner ───────────────────────────────────
  const partnerMap: Record<string, { company: string; orders: number; completed: number; billed: number; collected: number; outstanding: number; last: string }> = {}
  for (const o of O) {
    const key = o.client_company || o.client_email || '—'
    const p = (partnerMap[key] ??= { company: o.client_company || o.client_email || '—', orders: 0, completed: 0, billed: 0, collected: 0, outstanding: 0, last: o.created_at })
    p.orders++
    if (o.status === 'completed') p.completed++
    p.billed += o.client_fee
    if (o.client_paid_at) p.collected += o.client_fee
    if (o.status === 'completed' && !o.client_paid_at) p.outstanding += o.client_fee
    if (o.created_at > p.last) p.last = o.created_at
  }
  const partners = Object.values(partnerMap).sort((a, b) => b.billed - a.billed)

  // ─── By notary (tax-ready earnings) ─────────────────────
  const notaryMap: Record<string, { name: string; email: string; jobs: number; earned: number; paid: number; owed: number }> = {}
  for (const o of completed) {
    if (!o.notary_id) continue
    const n = (notaryMap[o.notary_id] ??= { name: nameById[o.notary_id] ?? '—', email: emailById[o.notary_id] ?? '', jobs: 0, earned: 0, paid: 0, owed: 0 })
    n.jobs++
    n.earned += o.notary_fee
    if (o.notary_paid_at) n.paid += o.notary_fee
    else n.owed += o.notary_fee
  }
  const notaryRows = Object.values(notaryMap).sort((a, b) => b.earned - a.earned)

  // ─── Sales rep commissions (tax-ready, 1099-NEC) ────────
  const repName = Object.fromEntries((salesReps ?? []).map((r) => [r.id, r.name]))
  const repEmail = Object.fromEntries((salesReps ?? []).map((r) => [r.id, r.email]))
  const taxYear = new Date().getFullYear()
  const repPayMap: Record<string, { name: string; email: string; total: number; thisYear: number }> = {}
  for (const p of salesPayouts ?? []) {
    const r = (repPayMap[p.sales_rep_id] ??= { name: repName[p.sales_rep_id] ?? '—', email: repEmail[p.sales_rep_id] ?? '', total: 0, thisYear: 0 })
    r.total += p.amount_cents
    const d = p.paid_at ?? p.created_at
    if (d && new Date(d).getFullYear() === taxYear) r.thisYear += p.amount_cents
  }
  const repRows = Object.values(repPayMap).sort((a, b) => b.total - a.total)
  const commissionsPaid = (salesPayouts ?? []).reduce((s, p) => s + p.amount_cents, 0)

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Metrics</h1>
        <p className="text-gray-500 text-sm mt-1">Everything for management, remediation, and tax season — exportable to CSV.</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Stat label="Total orders" value={String(O.length)} />
        <Stat label="Completed" value={`${completed.length} (${O.length ? Math.round((completed.length / O.length) * 100) : 0}%)`} />
        <Stat label="Revenue collected" value={formatCurrency(collected)} accent />
        <Stat label="Gross margin" value={formatCurrency(margin)} accent />
        <Stat label="Outstanding (unpaid)" value={formatCurrency(outstanding)} warn={outstanding > 0} />
        <Stat label="Paid to notaries" value={formatCurrency(paidOut)} />
        <Stat label="Owed to notaries" value={formatCurrency(owedOut)} warn={owedOut > 0} />
        <Stat label="Commissions paid" value={formatCurrency(commissionsPaid)} />
        <Stat label="Avg confirm time" value={avgConfirm != null ? `${avgConfirm} min` : '—'} />
        <Stat label="Completed (billed)" value={formatCurrency(billedCompleted)} />
        <Stat label="Issues reported" value={String(issues)} warn={issues > 0} />
        <Stat label="Client satisfaction" value={satisfaction != null ? `${satisfaction}% 👍 (${rated})` : '—'} warn={thumbsDown > 0} />
        <Stat label="Cancellations" value={String((cancellations ?? []).length)} warn={(cancellations ?? []).length > 0} />
        <Stat label="Active notaries" value={String((notaries ?? []).length)} />
      </div>

      {/* Title partners */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Title Partners</h2>
          <DownloadCsv
            label="Export partners CSV"
            filename="inksent-partners.csv"
            headers={['Company', 'Orders', 'Completed', 'Billed ($)', 'Collected ($)', 'Outstanding ($)', 'Last order']}
            rows={partners.map((p) => [p.company, p.orders, p.completed, money(p.billed), money(p.collected), money(p.outstanding), new Date(p.last).toLocaleDateString()])}
          />
        </div>
        <Table head={['Company', 'Orders', 'Completed', 'Billed', 'Collected', 'Outstanding']}>
          {partners.length === 0 ? <Empty cols={6} /> : partners.map((p) => (
            <tr key={p.company} className="border-t border-gray-100">
              <td className="px-4 py-2.5 font-medium text-gray-900">{p.company}</td>
              <td className="px-4 py-2.5 text-gray-600">{p.orders}</td>
              <td className="px-4 py-2.5 text-gray-600">{p.completed}</td>
              <td className="px-4 py-2.5 text-gray-700">{formatCurrency(p.billed)}</td>
              <td className="px-4 py-2.5 text-green-700">{formatCurrency(p.collected)}</td>
              <td className="px-4 py-2.5">{p.outstanding > 0 ? <span className="text-red-600 font-medium">{formatCurrency(p.outstanding)}</span> : <span className="text-gray-400">—</span>}</td>
            </tr>
          ))}
        </Table>
      </section>

      {/* Notary earnings (tax) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notary Earnings <span className="text-gray-400 normal-case font-normal">(1099 / tax)</span></h2>
          <DownloadCsv
            label="Export earnings CSV"
            filename="inksent-notary-earnings.csv"
            headers={['Notary', 'Email', 'Completed jobs', 'Earned ($)', 'Paid ($)', 'Owed ($)']}
            rows={notaryRows.map((n) => [n.name, n.email, n.jobs, money(n.earned), money(n.paid), money(n.owed)])}
          />
        </div>
        <Table head={['Notary', 'Jobs', 'Earned', 'Paid', 'Owed']}>
          {notaryRows.length === 0 ? <Empty cols={5} /> : notaryRows.map((n) => (
            <tr key={n.email} className="border-t border-gray-100">
              <td className="px-4 py-2.5 font-medium text-gray-900">{n.name}</td>
              <td className="px-4 py-2.5 text-gray-600">{n.jobs}</td>
              <td className="px-4 py-2.5 text-gray-700">{formatCurrency(n.earned)}</td>
              <td className="px-4 py-2.5 text-green-700">{formatCurrency(n.paid)}</td>
              <td className="px-4 py-2.5">{n.owed > 0 ? <span className="text-red-600 font-medium">{formatCurrency(n.owed)}</span> : <span className="text-gray-400">—</span>}</td>
            </tr>
          ))}
        </Table>
      </section>

      {/* Sales rep commissions (tax) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sales Rep Commissions <span className="text-gray-400 normal-case font-normal">(1099 / tax)</span></h2>
          <DownloadCsv
            label="Export commissions CSV"
            filename={`inksent-sales-commissions-${taxYear}.csv`}
            headers={['Rep', 'Email', 'Total paid ($)', `Paid ${taxYear} ($)`, '1099-NEC?']}
            rows={repRows.map((r) => [r.name, r.email, money(r.total), money(r.thisYear), r.thisYear >= 60000 ? 'YES (>=$600)' : 'no'])}
          />
        </div>
        <Table head={['Rep', 'Total paid', `Paid ${taxYear}`, '1099-NEC?']}>
          {repRows.length === 0 ? <Empty cols={4} /> : repRows.map((r) => (
            <tr key={r.email || r.name} className="border-t border-gray-100">
              <td className="px-4 py-2.5 font-medium text-gray-900">{r.name}</td>
              <td className="px-4 py-2.5 text-gray-700">{formatCurrency(r.total)}</td>
              <td className="px-4 py-2.5 text-gray-700">{formatCurrency(r.thisYear)}</td>
              <td className="px-4 py-2.5">{r.thisYear >= 60000 ? <span className="text-violet-700 font-medium">File 1099-NEC</span> : <span className="text-gray-400">—</span>}</td>
            </tr>
          ))}
        </Table>
        <p className="text-xs text-gray-400 mt-2">Reps paid $600+ in a calendar year need a 1099-NEC. Collect each rep&apos;s W-9 before their first payout (tracked on their rep page).</p>
      </section>

      {/* Full order export */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Orders</h2>
          <DownloadCsv
            label="Export all orders CSV"
            filename="inksent-orders.csv"
            headers={['Confirmation', 'Created', 'Signing date', 'Type', 'Signer', 'Location', 'Client', 'Billed ($)', 'Notary', 'Payout ($)', 'Status', 'Client paid', 'Notary paid', 'Issue']}
            rows={O.map((o) => [
              o.confirmation_number, new Date(o.created_at).toLocaleString(), o.signing_date, o.signing_type, o.signer_name,
              `${o.property_city ?? lookupZip(o.base_zip ?? '')?.city ?? ''}, ${o.property_state ?? ''}`,
              o.client_company, money(o.client_fee), o.notary_id ? (nameById[o.notary_id] ?? '') : '', money(o.notary_fee), o.status,
              o.client_paid_at ? new Date(o.client_paid_at).toLocaleDateString() : '', o.notary_paid_at ? new Date(o.notary_paid_at).toLocaleDateString() : '',
              o.issue_reported_at ? 'YES' : '',
            ])}
          />
        </div>
        <p className="text-xs text-gray-400">{O.length} orders captured. The CSV includes every field your accountant or a dispute would need.</p>
      </section>
    </div>
  )
}

function Stat({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-black ${warn ? 'text-red-600' : accent ? 'text-violet-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Empty({ cols }: { cols: number }) {
  return <tr><td colSpan={cols} className="px-4 py-10 text-center text-gray-400 text-sm">No data yet — this fills in as orders come through.</td></tr>
}
