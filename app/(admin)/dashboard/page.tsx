import { createClient } from '@/lib/supabase/server'
import { formatCurrency, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { format, startOfWeek, startOfMonth } from 'date-fns'
import Link from 'next/link'
import { ClipboardList, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, Users, Circle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getData() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0]
  const monthStart = startOfMonth(new Date()).toISOString().split('T')[0]

  const [allOrders, todaySignings, pendingNotaries, activeNotaries] = await Promise.all([
    supabase.from('orders').select('id, status, client_fee, notary_fee, created_at, client_paid_at, notary_paid_at, signing_date'),
    supabase
      .from('orders')
      .select('id, confirmation_number, status, signing_time, signer_name, property_city, signing_type, notaries(name, phone)')
      .eq('signing_date', today)
      .order('signing_time'),
    supabase.from('notaries').select('id', { count: 'exact', head: true }).eq('active', false),
    supabase.from('notaries').select('id, name, onboarded_at, payouts_enabled, created_at').eq('active', true).order('created_at', { ascending: false }),
  ])

  const orders = allOrders.data ?? []
  const completed = orders.filter(o => o.status === 'completed')

  // Revenue
  const totalRevenue = completed.reduce((s, o) => s + (o.client_fee - o.notary_fee), 0)
  const weekRevenue = completed
    .filter(o => o.signing_date >= weekStart)
    .reduce((s, o) => s + (o.client_fee - o.notary_fee), 0)
  const monthRevenue = completed
    .filter(o => o.signing_date >= monthStart)
    .reduce((s, o) => s + (o.client_fee - o.notary_fee), 0)

  // A/R — completed but client hasn't paid us
  const outstanding = completed
    .filter(o => !o.client_paid_at)
    .reduce((s, o) => s + o.client_fee, 0)

  // A/P — completed but we haven't paid notary
  const owedToNotaries = completed
    .filter(o => !o.notary_paid_at)
    .reduce((s, o) => s + o.notary_fee, 0)

  const active = orders.filter(o => ['pending', 'dispatching', 'assigned', 'confirmed'].includes(o.status)).length

  // Notary bench onboarding status: Approved → Profile (onboarded_at) → Bank (payouts_enabled)
  const bench = (activeNotaries.data ?? []).map(n => {
    const profile = !!n.onboarded_at
    const bank = !!n.payouts_enabled
    return { id: n.id, name: n.name, profile, bank, stage: profile && bank ? 'active' : profile ? 'bank' : 'profile' }
  })
  const fullyActive = bench.filter(b => b.stage === 'active').length

  return {
    bench,
    fullyActive,
    totalOrders: orders.length,
    completedCount: completed.length,
    activeCount: active,
    totalRevenue,
    weekRevenue,
    monthRevenue,
    outstanding,
    owedToNotaries,
    todaySignings: todaySignings.data ?? [],
    pendingNotaries: pendingNotaries.count ?? 0,
    recentOrders: orders.slice(0, 8),
  }
}

async function getRecentOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, confirmation_number, status, signing_date, signing_time, signer_name, property_city, signing_type, client_company')
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
}

export default async function DashboardPage() {
  const [data, recentOrders] = await Promise.all([getData(), getRecentOrders()])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        {data.pendingNotaries > 0 && (
          <Link href="/notaries" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors">
            <AlertCircle size={15} />
            {data.pendingNotaries} notary application{data.pendingNotaries > 1 ? 's' : ''} pending
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<ClipboardList className="text-violet-600" size={20} />} label="Total Orders" value={data.totalOrders} bg="bg-violet-50" />
        <StatCard icon={<Clock className="text-yellow-600" size={20} />} label="Active" value={data.activeCount} bg="bg-yellow-50" />
        <StatCard icon={<CheckCircle className="text-green-600" size={20} />} label="Completed" value={data.completedCount} bg="bg-green-50" />
        <StatCard icon={<DollarSign className="text-emerald-600" size={20} />} label="Total Profit" value={formatCurrency(data.totalRevenue)} bg="bg-emerald-50" />
      </div>

      {/* Revenue + A/R row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard label="This Week" value={formatCurrency(data.weekRevenue)} icon={<TrendingUp size={14} />} color="text-violet-600" />
        <MiniCard label="This Month" value={formatCurrency(data.monthRevenue)} icon={<TrendingUp size={14} />} color="text-violet-600" />
        <MiniCard
          label="Outstanding (A/R)"
          value={formatCurrency(data.outstanding)}
          icon={<AlertCircle size={14} />}
          color={data.outstanding > 0 ? 'text-amber-600' : 'text-gray-400'}
          sub="owed to us by clients"
        />
        <MiniCard
          label="Owed to Notaries"
          value={formatCurrency(data.owedToNotaries)}
          icon={<DollarSign size={14} />}
          color={data.owedToNotaries > 0 ? 'text-red-500' : 'text-gray-400'}
          sub="we haven't paid yet"
        />
      </div>

      {/* Today's signings */}
      {data.todaySignings.length > 0 && (
        <div className="bg-white rounded-xl border border-violet-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
            <Calendar size={15} className="text-violet-600" />
            <h2 className="font-semibold text-violet-900 text-sm">Today&apos;s Signings ({data.todaySignings.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.todaySignings.map((s: any) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.signer_name}</p>
                  <p className="text-xs text-gray-400">{s.property_city} · {s.signing_type.replace('_', ' ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{formatTime(s.signing_time)}</p>
                  {s.notaries?.name && <p className="text-xs text-violet-600">{s.notaries.name}</p>}
                </div>
                <div className="shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
                <Link href={`/orders/${s.id}`} className="text-xs text-violet-600 hover:underline shrink-0">Manage</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notary bench onboarding status */}
      {data.bench.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-violet-600" />
              <h2 className="font-semibold text-gray-900">Notary Bench</h2>
              <span className="text-xs text-gray-400">{data.fullyActive} of {data.bench.length} fully active</span>
            </div>
            <Link href="/notaries" className="text-sm text-violet-600 hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.bench.map((b: any) => (
              <div key={b.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <p className="font-medium text-gray-900 text-sm flex-1 min-w-0 truncate">{b.name}</p>
                <div className="hidden sm:flex items-center gap-3 text-xs">
                  <Step on label="Approved" />
                  <Step on={b.profile} label="Profile" />
                  <Step on={b.bank} label="Bank" />
                </div>
                <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${b.stage === 'active' ? 'bg-green-100 text-green-700' : b.stage === 'bank' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {b.stage === 'active' ? '✓ Fully active' : b.stage === 'bank' ? 'Can work · bank pending' : 'Needs profile'}
                </span>
                <Link href={`/notaries/${b.id}`} className="text-xs text-violet-600 hover:underline shrink-0">View</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-violet-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Confirmation</th>
                <th className="px-6 py-3 text-left">Signer</th>
                <th className="px-6 py-3 text-left">Date / Time</th>
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No orders yet</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{order.confirmation_number}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{order.signer_name}</td>
                    <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                      {format(new Date(order.signing_date), 'MMM d')} · {formatTime(order.signing_time)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{order.client_company}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/orders/${order.id}`} className="text-violet-600 hover:underline text-xs">Manage</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`${bg} rounded-lg p-2.5`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function MiniCard({ label, value, icon, color, sub }: { label: string; value: string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
      <div className={`flex items-center gap-1.5 text-xs font-medium ${color} mb-1`}>{icon}{label}</div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Step({ on, label }: { on?: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 ${on ? 'text-green-600' : 'text-gray-300'}`}>
      {on ? <CheckCircle size={12} /> : <Circle size={12} />} {label}
    </span>
  )
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
