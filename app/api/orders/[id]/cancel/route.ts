import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAuthClient } from '@/lib/supabase/server'
import { refundOrder } from '@/lib/stripe'
import { sendSMS } from '@/lib/sms'
import { format } from 'date-fns'

// Client-initiated cancellation. Auth: the logged-in title-company user must own
// the order (client_email match). Frees the notary, refunds if already paid,
// and alerts the assigned agent + admin.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('client_email', user.email)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status === 'completed') {
    return NextResponse.json({ error: 'This signing is already complete and can’t be cancelled here. Call us if there’s an issue.' }, { status: 400 })
  }
  if (order.status === 'cancelled') {
    return NextResponse.json({ ok: true, already: true })
  }

  // Core state change first (always works); stamp cancelled_at best-effort so this
  // can't fail if the site-features migration hasn't been applied yet.
  const { error: cancelErr } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id)
  if (cancelErr) return NextResponse.json({ error: 'Could not cancel — please try again.' }, { status: 500 })
  await supabase.from('orders').update({ cancelled_at: new Date().toISOString() }).eq('id', id)
    .then(({ error }) => { if (error) console.warn('cancelled_at stamp skipped:', error.message) })

  // Refund if the client already paid.
  let refunded = false
  if (order.client_paid_at) {
    const r = await refundOrder(id)
    refunded = r.ok
    if (r.ok) await supabase.from('orders').update({ refunded_at: new Date().toISOString() }).eq('id', id)
  }

  const dateStr = format(new Date(order.signing_date), 'MMM d')

  // Tell the assigned notary their job is off.
  if (order.notary_id) {
    const { data: n } = await supabase.from('notaries').select('name, phone').eq('id', order.notary_id).single()
    if (n?.phone) {
      await sendSMS(n.phone, `Heads up ${(n.name ?? '').split(' ')[0]} — the ${dateStr} signing for ${order.signer_name} (${order.confirmation_number}) was cancelled by the client. No action needed. Thanks! — Inksent`).catch(() => {})
    }
  }

  if (process.env.ADMIN_PHONE) {
    await sendSMS(process.env.ADMIN_PHONE, `🚫 ${order.client_company} cancelled ${order.confirmation_number} (${order.signer_name}, ${dateStr}).${order.client_paid_at ? (refunded ? ' Auto-refunded.' : ' ⚠️ Was paid but refund FAILED — handle in Stripe.') : ''}`).catch(() => {})
  }

  return NextResponse.json({ ok: true, refunded })
}
