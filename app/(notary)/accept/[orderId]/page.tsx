import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import AcceptButton from './AcceptButton'

export const dynamic = 'force-dynamic'

export default async function AcceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ notary?: string }>
}) {
  const { orderId } = await params
  const { notary: notaryId } = await searchParams

  if (!notaryId) notFound()

  const supabase = await createClient()
  const [orderResult, notaryResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', orderId).single(),
    supabase.from('notaries').select('name').eq('id', notaryId).single(),
  ])

  if (orderResult.error || !orderResult.data) notFound()
  const order = orderResult.data
  const notaryName = notaryResult.data?.name ?? 'Notary'

  const isExpired = order.status === 'cancelled'
  const isAlreadyAssigned = order.notary_id && order.notary_id !== notaryId
  const alreadyAccepted = order.notary_id === notaryId && order.status !== 'dispatching'

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-md border border-gray-200 p-7">
        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">Inksent</p>
        <h1 className="text-xl font-bold text-gray-900 mb-5">Signing Opportunity</h1>

        {isExpired ? (
          <div className="text-center py-4">
            <p className="text-red-600 font-medium">This order has been cancelled.</p>
          </div>
        ) : isAlreadyAssigned ? (
          <div className="text-center py-4">
            <p className="text-gray-500">This signing has already been claimed.</p>
          </div>
        ) : alreadyAccepted ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold">You&apos;ve already accepted this signing.</p>
            <p className="text-gray-500 text-sm mt-2">We&apos;ll be in touch with more details.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 text-sm">
              <Row label="Signer" value={order.signer_name} />
              <Row label="Type" value={order.signing_type.replace('_', ' ')} capitalize />
              <Row label="Date" value={format(new Date(order.signing_date), 'EEEE, MMMM d, yyyy')} />
              <Row label="Time" value={formatTime(order.signing_time)} />
              <Row label="Address" value={`${order.property_address}, ${order.property_city} ${order.property_zip}`} />
              <div className="border-t border-gray-100 pt-3">
                <Row label="Your Fee" value={`$${(order.notary_fee / 100).toFixed(0)}`} bold />
              </div>
            </div>

            {order.special_instructions && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 text-xs text-yellow-800">
                <strong>Note:</strong> {order.special_instructions}
              </div>
            )}

            <AcceptButton orderId={orderId} notaryId={notaryId} notaryName={notaryName.split(' ')[0]} />
          </>
        )}
      </div>
    </main>
  )
}

function Row({ label, value, capitalize, bold }: { label: string; value: string; capitalize?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-900 text-right ${capitalize ? 'capitalize' : ''} ${bold ? 'font-bold text-green-700' : ''}`}>
        {value}
      </span>
    </div>
  )
}
