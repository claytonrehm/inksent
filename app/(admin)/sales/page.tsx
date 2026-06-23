import Link from 'next/link'
import { TrendingUp, Users, Building2, FileSignature, DollarSign, ArrowRight, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { computeSalesData } from '@/lib/sales'
import { formatCurrency } from '@/lib/utils'
import AddRepForm from './AddRepForm'
import AssignAccountForm from './AssignAccountForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sales — Inksent Admin' }

export default async function SalesPage() {
  const supabase = await createClient()
  const { reps, unattributed, totals } = await computeSalesData(supabase)
  const { count: newApplicants } = await supabase
    .from('sales_rep_applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')

  const repOptions = reps.filter((r) => r.status === 'active').map((r) => ({ id: r.id, name: r.name }))
  const companySuggestions = unattributed.map((u) => u.display).filter(Boolean)

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp size={20} className="text-violet-600" /> Sales
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track sales reps, the title-company accounts they land, the signings those accounts send, and the commission you owe.
        </p>
      </div>

      <Link href="/sales/applicants" className={`flex items-center justify-between gap-3 rounded-xl border px-5 py-3.5 transition-colors ${newApplicants ? 'bg-violet-50 border-violet-200 hover:bg-violet-100' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
        <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <UserPlus size={16} className="text-violet-600" />
          {newApplicants ? `${newApplicants} new sales-rep applicant${newApplicants === 1 ? '' : 's'} to review` : 'Sales-rep applicants'}
        </span>
        <ArrowRight size={16} className="text-gray-400" />
      </Link>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat icon={<Users size={18} />} label="Active reps" value={`${totals.activeReps}`} sub={`${totals.reps} total`} />
        <Stat icon={<Building2 size={18} />} label="Accounts" value={`${totals.accounts}`} />
        <Stat icon={<FileSignature size={18} />} label="Collected signings" value={`${totals.collectedSignings}`} />
        <Stat icon={<DollarSign size={18} />} label="Commission earned" value={formatCurrency(totals.earnedCents)} />
        <Stat icon={<DollarSign size={18} />} label="Owed to reps" value={formatCurrency(totals.owedCents)} warn={totals.owedCents > 0} />
      </div>

      {/* Reps */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Sales Reps</h2>
          <AddRepForm />
        </div>

        {reps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
            No sales reps yet. Add your first rep to start tracking commission.
            <div className="mt-1 text-xs">If this stays empty after adding one, apply the <code className="text-violet-600">sales_reps</code> migration.</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Rep</th>
                  <th className="text-right px-4 py-2.5 font-medium">Accounts</th>
                  <th className="text-right px-4 py-2.5 font-medium">Signings</th>
                  <th className="text-right px-4 py-2.5 font-medium">Earned</th>
                  <th className="text-right px-4 py-2.5 font-medium">Paid</th>
                  <th className="text-right px-4 py-2.5 font-medium">Owed</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reps.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/sales/${r.id}`} className="font-medium text-gray-900 hover:text-violet-600">{r.name}</Link>
                      {r.status === 'inactive' && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">inactive</span>}
                      <div className="text-xs text-gray-400">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.accounts.length}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.collectedSignings}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(r.earnedCents)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(r.paidCents)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${r.owedCents > 0 ? 'text-red-600' : 'text-gray-400'}`}>{formatCurrency(r.owedCents)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/sales/${r.id}`} className="inline-flex text-gray-400 hover:text-violet-600"><ArrowRight size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Assign an account */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Assign an account to a rep</h2>
          <p className="text-xs text-gray-400 mb-4">Credit a title company to the rep who landed it. All of that company&apos;s collected signings then count toward their commission.</p>
          <AssignAccountForm reps={repOptions} companySuggestions={companySuggestions} />
        </div>

        {/* Unattributed companies */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Unassigned title companies</h2>
          <p className="text-xs text-gray-400 mb-4">Companies that have sent orders but aren&apos;t credited to any rep. Assign the ones a rep brought in.</p>
          {unattributed.length === 0 ? (
            <p className="text-sm text-gray-400">Every company with orders is assigned.</p>
          ) : (
            <div className="max-h-80 overflow-auto -mx-1">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="text-left px-1 py-1 font-medium">Company</th>
                    <th className="text-right px-1 py-1 font-medium">Collected</th>
                    <th className="text-right px-1 py-1 font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unattributed.map((u) => (
                    <tr key={u.key}>
                      <td className="px-1 py-2 text-gray-800">{u.display || <span className="text-gray-400 italic">(blank)</span>}</td>
                      <td className="px-1 py-2 text-right text-gray-600">{u.collectedSignings}</td>
                      <td className="px-1 py-2 text-right text-gray-400">{u.totalOrders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Stat({ icon, label, value, sub, warn }: { icon: React.ReactNode; label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4">
      <div className="flex items-center gap-2 text-gray-400">{icon}<span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className={`text-2xl font-black mt-1 ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}
