import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { STATUS_COLORS, STATUS_LABELS, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import { FileText, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PortalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, confirmation_number, status, signing_date, signing_time, signing_type, signer_name, property_city, property_state, client_fee, invoice_id, created_at')
    .eq('client_email', user.email)
    .order('created_at', { ascending: false })

  const totalSpend = (orders ?? [])
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.client_fee, 0)

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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Orders</p>
            <p className="text-3xl font-black text-gray-900">{orders?.length ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Completed</p>
            <p className="text-3xl font-black text-gray-900">{orders?.filter(o => o.status === 'completed').length ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Invoiced</p>
            <p className="text-3xl font-black text-violet-600">{formatCurrency(totalSpend)}</p>
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Confirmation</th>
                <th className="px-5 py-3 text-left">Signing</th>
                <th className="px-5 py-3 text-left">Signer</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Fee</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
