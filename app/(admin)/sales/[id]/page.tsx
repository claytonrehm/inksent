import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, FileSignature, DollarSign, Mail, Phone, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { computeSalesData } from '@/lib/sales'
import { formatCurrency } from '@/lib/utils'
import EditRepForm from './EditRepForm'
import OnboardingChecklist from './OnboardingChecklist'
import RecordPayoutForm from './RecordPayoutForm'
import AssignAccountForm from '../AssignAccountForm'
import DeleteButton from '../DeleteButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sales Rep — Inksent Admin' }

export default async function SalesRepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { reps, unattributed } = await computeSalesData(supabase)
  const rep = reps.find((r) => r.id === id)
  if (!rep) notFound()

  const companySuggestions = unattributed.map((u) => u.display).filter(Boolean)
  const dollarsPerSigning = formatCurrency(rep.residual_per_signing_cents)
  const after = formatCurrency(rep.residual_after_cents ?? 800)
  const months = rep.residual_months ?? 24
  const bonus = formatCurrency(rep.producer_bonus_cents)

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600">
        <ArrowLeft size={15} /> All sales reps
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {rep.name}
            {rep.status === 'inactive' && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">inactive</span>}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <a href={`mailto:${rep.email}`} className="flex items-center gap-1.5 hover:text-violet-600"><Mail size={13} /> {rep.email}</a>
            {rep.phone && <a href={`tel:${rep.phone}`} className="flex items-center gap-1.5 hover:text-violet-600"><Phone size={13} /> {rep.phone}</a>}
          </div>
        </div>
      </div>

      {/* Terms banner */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-900">
        <span className="font-semibold">{dollarsPerSigning}</span>/signing for the first <span className="font-semibold">{months} months</span> per account, then <span className="font-semibold">{after}/signing</span> ongoing · <span className="font-semibold">{bonus}</span> producer bonus at <span className="font-semibold">{rep.bonus_threshold}</span> signings.
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={<FileSignature size={18} />} label="Collected signings" value={`${rep.collectedSignings}`} />
        <Stat icon={<DollarSign size={18} />} label="Earned" value={formatCurrency(rep.earnedCents)} />
        <Stat icon={<DollarSign size={18} />} label="Paid" value={formatCurrency(rep.paidCents)} />
        <Stat icon={<DollarSign size={18} />} label="Owed" value={formatCurrency(rep.owedCents)} warn={rep.owedCents > 0} />
      </div>

      {/* Accounts */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Accounts ({rep.accounts.length})</h2>
        {rep.accounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No accounts assigned to this rep yet.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Company</th>
                  <th className="text-left px-4 py-2.5 font-medium">Landed</th>
                  <th className="text-right px-4 py-2.5 font-medium">Signings</th>
                  <th className="text-right px-4 py-2.5 font-medium">Residual</th>
                  <th className="text-right px-4 py-2.5 font-medium">Bonus</th>
                  <th className="text-right px-4 py-2.5 font-medium">Earned</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rep.accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{a.company_name}</div>
                      {a.status === 'dormant' && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">dormant</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.landed_at ? format(new Date(a.landed_at), 'MMM d, yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{a.collectedSignings}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(a.residualEarnedCents)}
                      {a.tier2Signings > 0 && <div className="text-xs text-gray-400">{a.tier1Signings} full · {a.tier2Signings} reduced</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.bonusReached
                        ? <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 size={13} /> {formatCurrency(a.bonusEarnedCents)}</span>
                        : <span className="text-gray-400">{a.collectedSignings}/{rep.bonus_threshold}</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(a.totalEarnedCents)}</td>
                    <td className="px-4 py-3 text-right"><DeleteButton url={`/api/admin/sales/accounts/${a.id}`} confirmLabel="Unassign?" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        {/* Assign account */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Assign an account</h2>
          <AssignAccountForm reps={[{ id: rep.id, name: rep.name }]} fixedRepId={rep.id} companySuggestions={companySuggestions} />
        </div>

        {/* Record payout */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Record a payout</h2>
          <p className="text-xs text-gray-400 mb-3">Logs a commission payment you&apos;ve made (it doesn&apos;t move money). Owed updates automatically.</p>
          <RecordPayoutForm repId={rep.id} owedCents={rep.owedCents} />
        </div>
      </section>

      {/* Payout history */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Payout history</h2>
        {rep.payouts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No payouts recorded yet.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Paid</th>
                  <th className="text-left px-4 py-2.5 font-medium">Period</th>
                  <th className="text-left px-4 py-2.5 font-medium">Note</th>
                  <th className="text-right px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rep.payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{p.paid_at ? format(new Date(p.paid_at), 'MMM d, yyyy') : format(new Date(p.created_at), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-gray-500">{p.period_label || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{p.note || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(p.amount_cents)}</td>
                    <td className="px-4 py-3 text-right"><DeleteButton url={`/api/admin/sales/payouts/${p.id}`} confirmLabel="Delete?" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Onboarding */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Onboarding</h2>
        <p className="text-xs text-gray-400 mb-4">Track what&apos;s needed before this rep starts selling.</p>
        <OnboardingChecklist rep={rep} />
      </section>

      {/* Edit rep */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit rep & commission terms</h2>
        <EditRepForm rep={rep} />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <DeleteButton url={`/api/admin/sales/reps/${rep.id}`} confirmLabel="Delete this rep permanently?" redirectTo="/sales" />
          <span className="ml-2 text-xs text-gray-400">Deletes the rep and all their account links + payout records.</span>
        </div>
      </section>
    </div>
  )
}

function Stat({ icon, label, value, warn }: { icon: React.ReactNode; label: string; value: string; warn?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4">
      <div className="flex items-center gap-2 text-gray-400">{icon}<span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className={`text-2xl font-black mt-1 ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}
