import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import InksentLogo from '@/components/InksentLogo'
import DocUpload from './DocUpload'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Upload Signing Documents — Inksent' }

export default async function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('id, confirmation_number, signer_name, signing_date, signing_time, property_city, documents, status')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const existing = (order.documents as { name: string }[] | null) ?? []
  const [h, m] = order.signing_time.split(':').map(Number)
  const timeStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto"><InksentLogo size="md" /></div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Upload Signing Documents</h1>
          <p className="text-gray-500">
            Securely send us the document package for this signing. The assigned notary gets it automatically — and if anything changes, the docs follow the job.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Signing</div>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <span className="text-gray-500">Confirmation</span><span className="text-right font-mono">{order.confirmation_number}</span>
            <span className="text-gray-500">Signer</span><span className="text-right font-medium">{order.signer_name}</span>
            <span className="text-gray-500">Date</span><span className="text-right">{format(new Date(order.signing_date), 'MMM d, yyyy')} · {timeStr}</span>
            <span className="text-gray-500">Location</span><span className="text-right">{order.property_city}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <DocUpload orderId={order.id} existing={existing} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Documents are stored securely and only shared with the assigned signing agent. Questions? orders@inksent.co
        </p>
      </div>
    </main>
  )
}
