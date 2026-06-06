import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import InksentLogo from '@/components/InksentLogo'
import CompleteForm from './CompleteForm'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Complete Your Signing — Inksent' }

export default async function CompletePage({
  params, searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ notary?: string }>
}) {
  const { orderId } = await params
  const { notary: notaryId } = await searchParams

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id, notary_id, signer_name, signing_date, signing_time, property_city, status, confirmation_number')
    .eq('id', orderId)
    .single()

  const authorized = order && notaryId && order.notary_id === notaryId
  const alreadyDone = order?.status === 'completed'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-md mx-auto"><InksentLogo size="md" /></div>
      </div>
      <div className="max-w-md mx-auto px-4 py-10">
        {!authorized ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <AlertTriangle className="text-amber-500 w-10 h-10 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-gray-900 mb-1">Not available</h1>
            <p className="text-gray-500 text-sm">This signing isn&apos;t assigned to you, or the link is no longer valid.</p>
          </div>
        ) : alreadyDone ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-1">Already marked complete</h1>
            <p className="text-gray-500 text-sm">Thanks! This signing is done and the invoice has been sent. Your payment will be processed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Finish up your signing</h1>
            <p className="text-gray-500 text-sm mb-5">
              {order.signer_name} · {format(new Date(order.signing_date), 'MMM d')} · {order.property_city}
            </p>
            <CompleteForm orderId={order.id} notaryId={notaryId!} />
          </div>
        )}
      </div>
    </main>
  )
}
