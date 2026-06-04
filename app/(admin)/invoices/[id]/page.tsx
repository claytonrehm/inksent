import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { buildInvoiceHTML } from '@/lib/invoice'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single()

  if (error || !order || !order.invoice_id) notFound()

  const html = buildInvoiceHTML({ ...order, invoice_number: order.invoice_id })

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:p-0">
      <div className="flex justify-end max-w-2xl mx-auto mb-4 px-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
        >
          Print / Save PDF
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
