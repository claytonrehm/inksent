import { createClient, createAuthClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { STATUS_COLORS, STATUS_LABELS, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import { FileText, Plus } from 'lucide-react'
import OrderActions from './OrderActions'

export const dynamic = 'force-dynamic'

export default async function PortalPage() {
  // Auth check uses the cookie-aware client; data reads use the service-role client.
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, confirmation_number, status, signing_date, signing_time, signing_type, signer_name, property_city, property_state, client_fee, invoice_id, created_at, completed_at, dispatched_at, accepted_at, client_satisfaction')
    .eq('client_email', user.email)
    .order('created_at', { ascending: false })

  const O = orders ?? []
  const completedOrders = O.filter(o => o.status === 'completed')
  const totalSpend = completedOrders.reduce((sum, o) => sum + o.client_fee, 0)

  // Partner-facing scorecard metrics (same view they saw in the demo).
  const confirmMins = O.filter(o => o.accepted_at && o.dispatched_at)
    .map(o => (new Date(o.accepted_at as string).getTime() - new Date(o.dispatched_at as string).getTime()) / 60000)
    .filter(m => m >= 0)
  const avgConfirm = confirmMins.length ? Math.round(confirmMins.reduce((s, m) => s + m, 0) / confirmMins.length) : null
  const up = O.filter(o => o.client_satisfaction === 'up').length
  const rated = up + O.filter(o => o.client_satisfaction === 'down').length
  const satisfaction = rated ? Math.round((up / rated) * 100) : null
  const hoursSaved = Math.round(completedOrders.length * 0.75) // ~45 min of coordination saved per signing

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <InksentLogo size="md" />
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Your Orders</h1>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
          >
            <Plus size={15} /> New Order
          </Link>
        </div>

        {/* Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <Metric label="Total orders" value={String(O.length)} />
          <Metric label="Completed" value={String(completedOrders.length)} />
          <Metric label="Avg confirm" value={avgConfirm != null ? `${avgConfirm} min` : '—'} good />
          <Metric label="Satisfaction" value={satisfaction != null ? `${satisfaction}% 👍` : '—'} good />
          <Metric label="Total invoiced" value={formatCurrency(totalSpend)} accent />
          <Metric label="Hours saved" value={hoursSaved > 0 ? `${hoursSaved} hrs` : '—'} />
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Confirmation</th>
                <th className="px-5 py-3 text-left">Signing</th>
                <th className="px-5 py-3 text-left">Signer</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Fee</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Invoice</th>
                <th className="px-5 py-3 text-left">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <p className="text-gray-400 mb-3">No orders yet</p>
                    <Link href="/order" className="text-violet-600 font-semibold hover:underline text-sm">Place your first order →</Link>
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.confirmation_number}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{format(new Date(order.signing_date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-gray-400">{formatTime(order.signing_time)}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{order.signer_name}</td>
                  <td className="px-5 py-3 text-gray-500">{order.property_city}, {order.property_state}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{formatCurrency(order.client_fee)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    {order.status === 'completed' && order.completed_at && (
                      <div className="text-[11px] text-gray-400 mt-1">{format(new Date(order.completed_at), 'MMM d, yyyy')}</div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {order.invoice_id ? (
                      <Link href={`/portal/invoices/${order.id}`} target="_blank" className="flex items-center gap-1 text-violet-600 hover:underline text-xs font-medium">
                        <FileText size={13} /> View
                      </Link>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <OrderActions orderId={order.id} status={order.status} signingDate={order.signing_date} signingTime={order.signing_time} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function Metric({ label, value, good, accent }: { label: string; value: string; good?: boolean; accent?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4">
      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-1 leading-tight">{label}</p>
      <p className={`text-2xl font-black ${good ? 'text-green-600' : accent ? 'text-violet-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
