import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { refundOrder } from '@/lib/stripe'
import { sendSMS } from '@/lib/sms'

// Admin-only: refund a client's payment for an order (Stripe), record it, and
// flag if the notary was already paid (you may need to recover that separately).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('confirmation_number, client_company, notary_paid_at, notary_fee')
    .eq('id', id)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const result = await refundOrder(id)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  await supabase.from('orders').update({ refunded_at: new Date().toISOString() }).eq('id', id)

  if (process.env.ADMIN_PHONE) {
    const clawback = order.notary_paid_at ? ` ⚠️ The notary was ALREADY paid $${(order.notary_fee / 100).toFixed(0)} — recover separately.` : ''
    sendSMS(process.env.ADMIN_PHONE, `↩️ Refunded ${order.client_company} for ${order.confirmation_number}.${clawback}`).catch(() => {})
  }

  return NextResponse.json({ ok: true, notaryAlreadyPaid: !!order.notary_paid_at })
}
