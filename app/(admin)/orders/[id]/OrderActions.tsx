'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send, UserCheck, X, CheckCircle } from 'lucide-react'

interface Notary { id: string; name: string; phone: string; zip_codes: string[] }
interface Order { id: string; status: string; notary_id: string | null; property_zip: string; notaries?: { name: string; phone: string; email: string } | null }

export default function OrderActions({ order, notaries }: { order: Order; notaries: Notary[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedNotary, setSelectedNotary] = useState(order.notary_id ?? '')

  const nearby = notaries.filter((n) => n.zip_codes.includes(order.property_zip))
  const others = notaries.filter((n) => !n.zip_codes.includes(order.property_zip))

  const sorted = [...nearby, ...others]

  async function dispatch() {
    if (!selectedNotary) return
    setLoading('dispatch')
    await fetch(`/api/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: order.id, notary_id: selectedNotary }),
    })
    setLoading(null)
    router.refresh()
  }

  async function updateStatus(status: string) {
    setLoading(status)
    await fetch(`/api/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      <h3 className="font-semibold text-gray-900">Dispatch & Actions</h3>

      {/* Currently assigned */}
      {order.notaries && (
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
          <UserCheck size={16} className="text-indigo-600 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-indigo-900">Assigned: {order.notaries.name}</span>
            <span className="text-indigo-600 ml-3">{order.notaries.phone}</span>
          </div>
        </div>
      )}

      {/* Notary picker */}
      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            {order.notary_id ? 'Reassign Notary' : 'Assign & Dispatch Notary'}
          </label>
          <select
            value={selectedNotary}
            onChange={(e) => setSelectedNotary(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select a notary...</option>
            {nearby.length > 0 && (
              <optgroup label={`Nearby (${order.property_zip})`}>
                {nearby.map((n) => (
                  <option key={n.id} value={n.id}>{n.name} · {n.phone}</option>
                ))}
              </optgroup>
            )}
            {others.length > 0 && (
              <optgroup label="Other notaries">
                {others.map((n) => (
                  <option key={n.id} value={n.id}>{n.name} · {n.phone}</option>
                ))}
              </optgroup>
            )}
          </select>
          <Button
            onClick={dispatch}
            loading={loading === 'dispatch'}
            disabled={!selectedNotary}
            className="w-full"
          >
            <Send size={15} className="mr-2" />
            {order.notary_id ? 'Reassign & Resend SMS' : 'Dispatch via SMS'}
          </Button>
        </div>
      )}

      {/* Status actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        {order.status === 'assigned' && (
          <Button variant="secondary" size="sm" loading={loading === 'confirmed'} onClick={() => updateStatus('confirmed')}>
            <UserCheck size={14} className="mr-1.5" /> Mark Confirmed
          </Button>
        )}
        {['confirmed', 'assigned'].includes(order.status) && (
          <Button variant="secondary" size="sm" loading={loading === 'completed'} onClick={() => updateStatus('completed')}>
            <CheckCircle size={14} className="mr-1.5" /> Mark Completed
          </Button>
        )}
        {!['completed', 'cancelled'].includes(order.status) && (
          <Button
            size="sm"
            className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            loading={loading === 'cancelled'}
            onClick={() => updateStatus('cancelled')}
          >
            <X size={14} className="mr-1.5" /> Cancel Order
          </Button>
        )}
      </div>
    </div>
  )
}
