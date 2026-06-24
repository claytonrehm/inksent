import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { refundOrder, reverseTransfer } from '@/lib/stripe'
import { sendSMS } from '@/lib/sms'
import { logAudit, reqIp } from '@/lib/audit'

// Admin-only: refund a client's payment for an order (Stripe), record it, and
// flag if the notary was already paid (you may need to recover that separately).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('confirmation_number, client_company, notary_paid_at, notary_fee, refunded_at, notary_transfer_id')
    .eq('id', id)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.refunded_at) return NextResponse.json({ error: 'This order was already refunded.' }, { status: 400 })

  const result = await refundOrder(id)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  await supabase.from('orders').update({ refunded_at: new Date().toISOString() }).eq('id', id)

  // If the notary was already paid, automatically reverse that transfer so a
  // refund never leaves us out the notary fee.
  let reversal: { ok: boolean; error?: string } | null = null
  if (order.notary_paid_at && order.notary_transfer_id) {
    reversal = await reverseTransfer(order.notary_transfer_id)
  }

  logAudit({ action: 'refund', actor: adminEmail(), actorType: 'admin', entityType: 'order', entityId: id, ip: reqIp(req), meta: { confirmation_number: order.confirmation_number, client_company: order.client_company, notaryAlreadyPaid: !!order.notary_paid_at, payoutReversed: reversal?.ok ?? null } })

  if (process.env.ADMIN_PHONE) {
    let note = ''
    if (order.notary_paid_at) {
      note = reversal?.ok
        ? ` ↪️ Notary payout of $${(order.notary_fee / 100).toFixed(0)} was auto-reversed.`
        : ` ⚠️ Notary was paid $${(order.notary_fee / 100).toFixed(0)} and auto-reversal ${order.notary_transfer_id ? 'FAILED' : 'unavailable'} — recover manually.`
    }
    sendSMS(process.env.ADMIN_PHONE, `↩️ Refunded ${order.client_company} for ${order.confirmation_number}.${note}`).catch(() => {})
  }

  return NextResponse.json({ ok: true, notaryAlreadyPaid: !!order.notary_paid_at, payoutReversed: reversal?.ok ?? null })
}
