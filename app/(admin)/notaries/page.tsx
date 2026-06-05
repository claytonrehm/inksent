import { createClient } from '@/lib/supabase/server'
import AddNotaryForm from './AddNotaryForm'
import NotaryActions from './NotaryActions'
import PendingCard from './PendingCard'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, Star } from 'lucide-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function NotariesPage() {
  const supabase = await createClient()

  const [{ data: notaries }, { data: orders }, { data: ratings }] = await Promise.all([
    supabase.from('notaries').select('*').order('active', { ascending: false }).order('name'),
    supabase
      .from('orders')
      .select('notary_id, notary_fee, notary_paid_at, status')
      .eq('status', 'completed')
      .not('notary_id', 'is', null),
    supabase.from('notary_ratings').select('notary_id, rating'),
  ])

  const pending = (notaries ?? []).filter(n => !n.active)
  const active = (notaries ?? []).filter(n => n.active)

  const stats: Record<string, { paid: number; unpaid: number; ytd: number; count: number }> = {}
  for (const o of orders ?? []) {
    if (!o.notary_id) continue
    if (!stats[o.notary_id]) stats[o.notary_id] = { paid: 0, unpaid: 0, ytd: 0, count: 0 }
    stats[o.notary_id].count++
    stats[o.notary_id].ytd += o.notary_fee
    if (o.notary_paid_at) stats[o.notary_id].paid += o.notary_fee
    else stats[o.notary_id].unpaid += o.notary_fee
  }

  const totalUnpaid = Object.values(stats).reduce((s, n) => s + n.unpaid, 0)

  const avgRatings: Record<string, { sum: number; n: number }> = {}
  for (const r of ratings ?? []) {
    if (!r.notary_id || !r.rating) continue
    if (!avgRatings[r.notary_id]) avgRatings[r.notary_id] = { sum: 0, n: 0 }
    avgRatings[r.notary_id].sum += r.rating
    avgRatings[r.notary_id].n += 1
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notary Network</h1>
          <p className="text-gray-500 text-sm mt-1">{active.length} active · {pending.length} pending approval</p>
        </div>
        {totalUnpaid > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2 rounded-xl">
            <AlertCircle size={15} />
            {formatCurrency(totalUnpaid)} unpaid to notaries
          </div>
        )}
      </div>

      {/* Pending applications — card layout */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle size={14} /> Pending Applications ({pending.length})
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {pending.map(n => <PendingCard key={n.id} notary={n} />)}
          </div>
        </div>
      )}

      {/* Active bench */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Active Bench ({active.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Agent</th>
                <th className="px-4 py-3 text-left">Credentials</th>
                <th className="px-4 py-3 text-left">ZIPs</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-right">Jobs</th>
                <th className="px-4 py-3 text-right">YTD</th>
                <th className="px-4 py-3 text-right">Owed</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {active.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    No active notaries yet — approve a pending application to build your bench
                  </td>
                </tr>
              ) : (
                active.map((n) => {
                  const s = stats[n.id]
                  const ar = avgRatings[n.id]
                  const avg = ar ? ar.sum / ar.n : null
                  return (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {n.photo_url ? (
                            <Image src={n.photo_url} alt={n.name} width={36} height={36}
                              className="rounded-full object-cover shrink-0 border border-gray-200"
                              style={{ width: 36, height: 36 }} />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
                              {n.name.split(' ').map((w: string) => w[0]).join('').slice(0,2)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 text-sm whitespace-nowrap">{n.name}</div>
                            <div className="text-xs text-gray-400">{n.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {n.nna_certified && <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">NNA</span>}
                          {n.eo_carrier && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">E&O</span>}
                          {n.years_experience && <span className="text-xs text-gray-500">{n.years_experience}yr</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {(n.zip_codes ?? []).slice(0, 3).map((z: string) => (
                            <span key={z} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{z}</span>
                          ))}
                          {(n.zip_codes ?? []).length > 3 && (
                            <span className="text-xs text-gray-400">+{(n.zip_codes ?? []).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {avg ? (
                          <div className="flex items-center justify-end gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-gray-700">{avg.toFixed(1)}</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{s?.count ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${(s?.ytd ?? 0) >= 60000 ? 'text-amber-600' : 'text-gray-700'}`}>
                          {formatCurrency(s?.ytd ?? 0)}
                        </span>
                        {(s?.ytd ?? 0) >= 60000 && <div className="text-xs text-amber-500">1099 ⚠</div>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(s?.unpaid ?? 0) > 0
                          ? <span className="text-sm font-semibold text-red-600">{formatCurrency(s.unpaid)}</span>
                          : <span className="text-sm text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end">
                          <NotaryActions notaryId={n.id} active={true} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          YTD turns amber at $600 — file a 1099-NEC for any notary crossing that threshold.
        </p>
      </div>

      {/* Add notary manually */}
      <div className="max-w-md">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Add Manually</h2>
        <AddNotaryForm />
      </div>
    </div>
  )
}
