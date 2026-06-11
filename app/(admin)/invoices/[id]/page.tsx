import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { buildInvoiceHTML } from '@/lib/invoice'
import PrintButton from './PrintButton'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single()

  if (error || !order || !order.invoice_id) notFound()

  const html = buildInvoiceHTML({ ...order, invoice_number: order.invoice_id, pay_url: order.client_paid_at ? null : order.pay_url })

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:p-0">
      <div className="flex justify-end max-w-2xl mx-auto mb-4 px-4 print:hidden">
        <PrintButton />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
