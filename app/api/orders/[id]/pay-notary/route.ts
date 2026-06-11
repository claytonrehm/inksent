import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { payoutNotary } from '@/lib/stripe'
import { sendSMS } from '@/lib/sms'
import { logAudit, reqIp } from '@/lib/audit'

// Admin "Pay Notary" — actually moves the money via Stripe, and ONLY marks the
// order paid + texts the notary if the transfer truly succeeds. Never tells a
// notary they're paid before the funds are real.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('confirmation_number, notary_fee, notary_paid_at, notaries(name, phone, stripe_account_id, payouts_enabled)')
    .eq('id', id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.notary_paid_at) return NextResponse.json({ error: 'This notary has already been paid for this signing.' }, { status: 400 })

  const nRaw = order.notaries as unknown
  const n = (Array.isArray(nRaw) ? nRaw[0] : nRaw) as { name: string; phone: string; stripe_account_id?: string; payouts_enabled?: boolean } | null
  if (!n) return NextResponse.json({ error: 'No notary assigned to this order.' }, { status: 400 })
  if (!n.stripe_account_id || !n.payouts_enabled) {
    return NextResponse.json({ error: `${n.name} hasn't connected payouts yet — can't send money. Have them finish Stripe bank setup first.` }, { status: 400 })
  }

  // Move the money first. Only on success do we mark paid + notify.
  const ok = await payoutNotary({
    stripeAccountId: n.stripe_account_id,
    amount: order.notary_fee,
    orderId: id,
    confirmationNumber: order.confirmation_number,
  })
  if (!ok) {
    return NextResponse.json({ error: 'Stripe transfer failed — check your available balance and their account. Nothing was marked paid.' }, { status: 400 })
  }

  await supabase.from('orders').update({ notary_paid_at: new Date().toISOString() }).eq('id', id)

  logAudit({ action: 'pay_notary', actor: adminEmail(), actorType: 'admin', entityType: 'order', entityId: id, ip: reqIp(req), meta: { confirmation_number: order.confirmation_number, amount_cents: order.notary_fee, notary: n.name } })

  if (n.phone) {
    const firstName = n.name.split(' ')[0]
    sendSMS(
      n.phone,
      `💵 Payment released: $${(order.notary_fee / 100).toFixed(0)} for the ${order.confirmation_number} signing — on its way to your bank account. Thanks for a great job! — Clayton, Inksent`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
