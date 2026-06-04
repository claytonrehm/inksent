import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { buildInvoiceHTML } from '@/lib/invoice'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

export default async function ClientInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('client_email', user.email)
    .single()

  if (!order || !order.invoice_id) notFound()

  const html = buildInvoiceHTML({ ...order, invoice_number: order.invoice_id })

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:p-0">
      <div className="flex justify-between max-w-2xl mx-auto mb-4 px-4 print:hidden">
        <a href="/portal" className="text-sm text-violet-600 hover:underline font-medium">← Back to portal</a>
        <PrintButton />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
