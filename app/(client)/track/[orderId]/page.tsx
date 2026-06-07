import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import InksentLogo from '@/components/InksentLogo'
import { CheckCircle, Circle, Loader2, UserCheck, FileSignature, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Track Your Signing — Inksent' }

const STAGES = [
  { key: 'received', label: 'Order received', icon: CheckCircle },
  { key: 'finding', label: 'Finding your signing agent', icon: UserCheck },
  { key: 'confirmed', label: 'Agent confirmed', icon: UserCheck },
  { key: 'complete', label: 'Signing complete', icon: FileSignature },
]

function stageIndex(status: string): number {
  if (status === 'completed') return 3
  if (status === 'assigned' || status === 'confirmed') return 2
  if (status === 'dispatching' || status === 'pending') return 1
  return 0
}

export default async function TrackPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id, confirmation_number, status, signing_date, signing_time, signer_name, property_city, property_state, notaries(name, photo_url, nna_certified)')
    .eq('id', orderId)
    .single()

  if (!order) notFound()

  const cancelled = order.status === 'cancelled'
  const current = stageIndex(order.status)
  const notaryRaw = order.notaries as unknown
  const notary = (Array.isArray(notaryRaw) ? notaryRaw[0] : notaryRaw) as { name: string; photo_url?: string; nna_certified: boolean } | null
  const [h, m] = order.signing_time.split(':').map(Number)
  const timeStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`

  return (
    <main className="min-h-screen bg-gray-50">
      {/* auto-refresh every 30s for live updates */}
      <meta httpEquiv="refresh" content="30" />
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-lg mx-auto"><InksentLogo size="md" /></div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-2 text-xs font-mono text-gray-400">{order.confirmation_number}</div>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Signing for {order.signer_name}</h1>
        <p className="text-gray-500 mb-8">{format(new Date(order.signing_date), 'EEEE, MMMM d')} · {timeStr} · {order.property_city}, {order.property_state}</p>

        {cancelled ? (
          <div className="bg-white rounded-2xl border border-red-200 shadow-md p-8 text-center">
            <XCircle className="text-red-500 w-12 h-12 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">This order was cancelled</h2>
            <p className="text-gray-500 text-sm mt-1">Questions? Call (619) 949-3361.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            {/* Assigned agent card */}
            {notary && current >= 2 && (
              <div className="flex items-center gap-4 bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6">
                {notary.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={notary.photo_url} alt={notary.name} className="rounded-full object-cover border border-violet-200" style={{ width: 52, height: 52 }} />
                ) : (
                  <div className="rounded-full bg-violet-200 text-violet-700 flex items-center justify-center font-bold" style={{ width: 52, height: 52 }}>
                    {notary.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900">{notary.name}</div>
                  <div className="text-xs text-gray-500">Your signing agent{notary.nna_certified ? ' · NNA-Certified' : ''}</div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-1">
              {STAGES.map((stage, i) => {
                const state = i < current ? 'done' : i === current ? 'active' : 'pending'
                return (
                  <div key={stage.key} className="flex items-center gap-3 py-2">
                    <div className="shrink-0">
                      {state === 'done' ? <CheckCircle size={22} className="text-green-500" />
                        : state === 'active' ? <Loader2 size={22} className="text-violet-500 animate-spin" />
                        : <Circle size={22} className="text-gray-200" />}
                    </div>
                    <span className={`text-sm ${state === 'pending' ? 'text-gray-300' : state === 'active' ? 'font-semibold text-violet-700' : 'text-gray-700'}`}>
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
              This page updates automatically. Questions? (619) 949-3361
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
