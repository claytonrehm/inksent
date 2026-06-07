import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { sendInvoiceEmail, generateInvoiceNumber } from '@/lib/invoice'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json()

  const valid = ['pending', 'dispatching', 'assigned', 'confirmed', 'completed', 'cancelled']
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = await createClient()

  // If completing, generate invoice number
  const updateData: Record<string, string> = { status }
  if (status === 'completed') {
    updateData.invoice_id = generateInvoiceNumber(id)
  }

  const { error } = await supabase.from('orders').update(updateData).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-send invoice email on completion
  if (status === 'completed') {
    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
    if (order && order.client_email && process.env.RESEND_API_KEY !== 're_...') {
      await sendInvoiceEmail({ ...order, invoice_number: order.invoice_id }).catch(console.error)
    }
  }

  return NextResponse.json({ ok: true })
}
