import { createClient } from '@/lib/supabase/server'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import InksentLogo from '@/components/InksentLogo'
import { FileText, Download, ShieldCheck, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your Signing Documents — Inksent' }

export default async function DocsPage({
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
    .select('id, notary_id, signer_name, signing_date, signing_time, property_address, property_city, property_state, property_zip, documents, status')
    .eq('id', orderId)
    .single()

  // Access control: only the currently-assigned notary can see the docs
  const authorized = order && notaryId && order.notary_id === notaryId

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto"><InksentLogo size="md" /></div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {!authorized ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="bg-amber-50 rounded-full p-4 w-fit mx-auto mb-4">
              <AlertTriangle className="text-amber-500 w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Documents not available</h1>
            <p className="text-gray-500 max-w-sm mx-auto">
              This signing is assigned to a different agent, or the assignment has changed. If you believe this is an error, contact us at orders@inksent.co.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm">
              <ShieldCheck size={16} /> Verified — these documents are for your assigned signing.
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Signing Documents</h1>
            <p className="text-gray-500 mb-6">
              {order.signer_name} · {format(new Date(order.signing_date), 'EEEE, MMM d')} · {order.property_address}, {order.property_city}, {order.property_state} {order.property_zip}
            </p>

            <DocsList orderId={orderId} documents={(order.documents as { name: string; path: string }[]) ?? []} />

            <p className="text-center text-xs text-gray-400 mt-6">
              🔒 Download links are private and expire. Please print and bring all documents to the signing.
            </p>
          </>
        )}
      </div>
    </main>
  )
}

async function DocsList({ orderId, documents }: { orderId: string; documents: { name: string; path: string }[] }) {
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        No documents have been uploaded yet. You&apos;ll be notified when they&apos;re ready.
      </div>
    )
  }

  if (!hasServiceRole()) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Document delivery is being finalized. Please check back shortly or contact orders@inksent.co.
      </div>
    )
  }

  // Generate short-lived signed URLs (2 hours) for each document
  const admin = createAdminClient()
  const links = await Promise.all(
    documents.map(async (d) => {
      const { data } = await admin.storage.from('signing-docs').createSignedUrl(d.path, 60 * 60 * 2)
      return { name: d.name, url: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
      {links.map((l, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <FileText size={18} className="text-violet-500 shrink-0" />
          <span className="flex-1 text-sm text-gray-800 truncate">{l.name}</span>
          {l.url ? (
            <a href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
              <Download size={14} /> Download
            </a>
          ) : (
            <span className="text-xs text-red-500">Unavailable</span>
          )}
        </div>
      ))}
    </div>
  )
}
