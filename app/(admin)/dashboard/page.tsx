import { createClient } from '@/lib/supabase/server'
import { formatCurrency, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { ClipboardList, DollarSign, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = await createClient()

  const [allOrders, todayOrders] = await Promise.all([
    supabase.from('orders').select('status, client_fee, notary_fee, created_at'),
    supabase
      .from('orders')
      .select('id')
      .gte('created_at', new Date().toISOString().split('T')[0]),
  ])

  const orders = allOrders.data ?? []
  const total = orders.length
  const completed = orders.filter((o) => o.status === 'completed').length
  const pending = orders.filter((o) => ['pending', 'dispatching', 'assigned', 'confirmed'].includes(o.status)).length
  const revenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.client_fee - o.notary_fee), 0)

  return { total, completed, pending, revenue, today: todayOrders.data?.length ?? 0 }
}

async function getRecentOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, confirmation_number, status, signing_date, signing_time, signer_name, property_city, signing_type, client_company')
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

export default async function DashboardPage() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<ClipboardList className="text-violet-600" size={20} />}
          label="Total Orders"
          value={stats.total}
          bg="bg-violet-50"
        />
        <StatCard
          icon={<Clock className="text-yellow-600" size={20} />}
          label="Active / Pending"
          value={stats.pending}
          bg="bg-yellow-50"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" size={20} />}
          label="Completed"
          value={stats.completed}
          bg="bg-green-50"
        />
        <StatCard
          icon={<DollarSign className="text-emerald-600" size={20} />}
          label="Net Revenue"
          value={formatCurrency(stats.revenue)}
          bg="bg-emerald-50"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-violet-600 hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left">Confirmation</th>
              <th className="px-6 py-3 text-left">Signer</th>
              <th className="px-6 py-3 text-left">Date / Time</th>
              <th className="px-6 py-3 text-left">City</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-400">No orders yet</td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-gray-600">{order.confirmation_number}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{order.signer_name}</td>
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(order.signing_date), 'MMM d')} · {formatTime(order.signing_time)}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{order.property_city}</td>
                  <td className="px-6 py-3 text-gray-600 capitalize">{order.signing_type.replace('_', ' ')}</td>
                  <td className="px-6 py-3 text-gray-600">{order.client_company}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-violet-600 hover:underline text-xs">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode
  label: string
  value: string | number
  bg: string
}) {
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

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
