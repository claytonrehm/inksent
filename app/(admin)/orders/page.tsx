import { createClient } from '@/lib/supabase/server'
import { formatCurrency, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, confirmation_number, status, signing_date, signing_time, signer_name, property_address, property_city, signing_type, client_company, client_name, client_fee, notary_fee, notary_id')
    .order('signing_date', { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <Link
          href="/order"
          target="_blank"
          className="text-sm bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700"
        >
          + New Order
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Confirmation</th>
              <th className="px-4 py-3 text-left">Signing</th>
              <th className="px-4 py-3 text-left">Signer</th>
              <th className="px-4 py-3 text-left">Property</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Spread</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No orders yet</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.confirmation_number}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    <div>{format(new Date(order.signing_date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-gray-400">{formatTime(order.signing_time)}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.signer_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="max-w-[160px] truncate">{order.property_address}</div>
                    <div className="text-xs text-gray-400">{order.property_city}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{order.client_company}</div>
                    <div className="text-xs text-gray-400">{order.client_name}</div>
                  </td>
                  <td className="px-4 py-3 text-green-700 font-medium">
                    {formatCurrency(order.client_fee - order.notary_fee)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
