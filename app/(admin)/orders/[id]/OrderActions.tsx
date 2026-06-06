'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send, UserCheck, X, CheckCircle, DollarSign, Zap, Star, ShieldAlert } from 'lucide-react'

interface Notary { id: string; name: string; phone: string; covers: boolean; distance: number | null }
interface Order {
  id: string
  status: string
  notary_id: string | null
  property_zip: string
  notary_paid_at?: string | null
  client_paid_at?: string | null
  notary_fee?: number
  client_fee?: number
  dispatched_to?: string[]
  hold_for_review?: boolean
  client_company?: string
  notaries?: { name: string; phone: string; email: string } | null
}

export default function OrderActions({ order, notaries }: { order: Order; notaries: Notary[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedNotary, setSelectedNotary] = useState(order.notary_id ?? '')
  const [blastSelected, setBlastSelected] = useState<string[]>([])
  const [mode, setMode] = useState<'single' | 'blast'>('single')
  const [rating, setRating] = useState(0)
  const [ratingHover, setRatingHover] = useState(0)
  const [ratingChecks, setRatingChecks] = useState({ on_time: false, docs_complete: false, professional: false })
  const [ratingNotes, setRatingNotes] = useState('')
  const [ratingSaved, setRatingSaved] = useState(false)

  const nearby = notaries.filter((n) => n.covers)
  const others = notaries.filter((n) => !n.covers)
  const sorted = [...nearby, ...others]
  const distLabel = (n: Notary) => n.distance != null ? `${n.distance} mi` : ''

  function toggleBlast(id: string) {
    setBlastSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function selectAllNearby() {
    setBlastSelected(nearby.map(n => n.id))
  }

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

  async function blastDispatch() {
    if (blastSelected.length === 0) return
    setLoading('blast')
    await fetch(`/api/dispatch/blast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: order.id, notary_ids: blastSelected }),
    })
    setLoading(null)
    router.refresh()
  }

  async function saveRating() {
    if (!rating || !order.notary_id) return
    setLoading('rating')
    await fetch(`/api/orders/${order.id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notary_id: order.notary_id, rating, ...ratingChecks, notes: ratingNotes }),
    })
    setLoading(null)
    setRatingSaved(true)
  }

  async function markClientPaid() {
    setLoading('client_paid')
    await fetch(`/api/orders/${order.id}/pay-client`, { method: 'POST' })
    setLoading(null)
    router.refresh()
  }

  async function markNotaryPaid() {
    setLoading('notary_paid')
    await fetch(`/api/orders/${order.id}/pay-notary`, { method: 'POST' })
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

  async function releaseOrder() {
    setLoading('release')
    await fetch(`/api/orders/${order.id}/release`, { method: 'POST' })
    setLoading(null)
    router.refresh()
  }

  const isDone = order.status === 'completed' || order.status === 'cancelled'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h3 className="font-semibold text-gray-900">Dispatch & Actions</h3>

      {/* First-time client hold (spam gate) */}
      {order.hold_for_review && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">First order from {order.client_company || 'this client'} — held for review</p>
              <p className="text-xs text-amber-700 mt-0.5">We didn&apos;t blast your notaries yet. If this looks legit, release it to dispatch. Future orders from them auto-blast.</p>
              <Button size="sm" loading={loading === 'release'} onClick={releaseOrder} className="mt-3">
                <CheckCircle size={14} className="mr-1.5" /> Release &amp; Dispatch
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Blasted but no response yet */}
      {!order.notary_id && order.status === 'dispatching' && (order.dispatched_to ?? []).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <strong>Waiting for response</strong> — blasted to {order.dispatched_to!.length} notaries. First to accept gets it.
        </div>
      )}

      {!isDone && (
        <>
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-2 transition-colors ${mode === 'single' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Single Notary
            </button>
            <button
              onClick={() => setMode('blast')}
              className={`flex-1 py-2 transition-colors flex items-center justify-center gap-1.5 ${mode === 'blast' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Zap size={13} /> Blast to Many
            </button>
          </div>

          {mode === 'single' ? (
            <div className="space-y-3">
              <select
                value={selectedNotary}
                onChange={(e) => setSelectedNotary(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select a notary...</option>
                {nearby.length > 0 && (
                  <optgroup label={`Covers ${order.property_zip}`}>
                    {nearby.map((n) => <option key={n.id} value={n.id}>{n.name} · {distLabel(n)} · {n.phone}</option>)}
                  </optgroup>
                )}
                {others.length > 0 && (
                  <optgroup label="Out of coverage area">
                    {others.map((n) => <option key={n.id} value={n.id}>{n.name}{n.distance != null ? ` · ${n.distance} mi away` : ''} · {n.phone}</option>)}
                  </optgroup>
                )}
              </select>
              <Button onClick={dispatch} loading={loading === 'dispatch'} disabled={!selectedNotary} className="w-full">
                <Send size={15} className="mr-2" />
                {order.notary_id ? 'Reassign & Resend SMS' : 'Dispatch via SMS'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Select notaries to blast — first to accept wins.</p>
                {nearby.length > 0 && (
                  <button onClick={selectAllNearby} className="text-xs text-violet-600 hover:underline">
                    Select nearby ({nearby.length})
                  </button>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {sorted.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No active notaries yet</p>
                ) : sorted.map((n) => (
                  <label key={n.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blastSelected.includes(n.id)}
                      onChange={() => toggleBlast(n.id)}
                      className="rounded text-violet-600"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">{n.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{n.phone}</span>
                    </div>
                    {n.distance != null && (
                      <span className="text-xs text-gray-400">{n.distance} mi</span>
                    )}
                    {n.covers && (
                      <span className="text-xs bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded">covers</span>
                    )}
                  </label>
                ))}
              </div>
              <Button
                onClick={blastDispatch}
                loading={loading === 'blast'}
                disabled={blastSelected.length === 0}
                className="w-full"
              >
                <Zap size={15} className="mr-2" />
                Blast to {blastSelected.length > 0 ? blastSelected.length : '...'} Notaries
              </Button>
            </div>
          )}
        </>
      )}

      {/* Rate notary */}
      {order.status === 'completed' && order.notary_id && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Star size={12} /> Rate This Notary
          </p>
          {ratingSaved ? (
            <div className="flex items-center gap-2 text-sm text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-4 py-2.5">
              <CheckCircle size={14} /> Rating saved
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button"
                    onMouseEnter={() => setRatingHover(n)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setRating(n)}
                    className="p-1"
                  >
                    <Star size={22} className={`transition-colors ${n <= (ratingHover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
                {rating > 0 && <span className="text-xs text-gray-400 self-center ml-1">{['','Poor','Fair','Good','Great','Excellent'][rating]}</span>}
              </div>
              <div className="flex gap-3 flex-wrap">
                {(['on_time', 'docs_complete', 'professional'] as const).map(key => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600">
                    <input type="checkbox" className="rounded text-violet-600"
                      checked={ratingChecks[key]}
                      onChange={e => setRatingChecks(prev => ({ ...prev, [key]: e.target.checked }))} />
                    {key === 'on_time' ? 'On time' : key === 'docs_complete' ? 'Docs complete' : 'Professional'}
                  </label>
                ))}
              </div>
              <textarea
                value={ratingNotes}
                onChange={e => setRatingNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
              <Button size="sm" variant="secondary" onClick={saveRating} loading={loading === 'rating'} disabled={!rating}>
                Save Rating
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Client payment tracking */}
      {order.status === 'completed' && (
        <div className="pt-2 border-t border-gray-100">
          {order.client_paid_at ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              <CheckCircle size={14} /> Client paid ${order.client_fee ? (order.client_fee / 100).toFixed(0) : '185'} on {new Date(order.client_paid_at).toLocaleDateString()}
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              loading={loading === 'client_paid'}
              onClick={markClientPaid}
              className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <DollarSign size={14} className="mr-1.5" />
              Mark Client Paid (${order.client_fee ? (order.client_fee / 100).toFixed(0) : '185'})
            </Button>
          )}
        </div>
      )}

      {/* Notary payment */}
      {order.status === 'completed' && order.notary_id && (
        <div className="pt-2 border-t border-gray-100">
          {order.notary_paid_at ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              <CheckCircle size={14} />
              Notary paid {new Date(order.notary_paid_at).toLocaleDateString()}
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              loading={loading === 'notary_paid'}
              onClick={markNotaryPaid}
              className="w-full bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            >
              <DollarSign size={14} className="mr-1.5" />
              Mark Notary Paid (${order.notary_fee ? (order.notary_fee / 100).toFixed(0) : '90'})
            </Button>
          )}
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
        {!isDone && (
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
