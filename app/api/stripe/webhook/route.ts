import { NextRequest, NextResponse } from 'next/server'
import { getStripe, hasStripe, payoutNotary } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

// Stripe calls this when an invoice is paid. We mark the order client-paid
// automatically — no manual reconciliation.
export async function POST(req: NextRequest) {
  if (!hasStripe()) return NextResponse.json({ error: 'stripe not configured' }, { status: 400 })

  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const body = await req.text()

  let event
  try {
    const stripe = getStripe()
    event = secret && sig
      ? stripe.webhooks.constructEvent(body, sig, secret)
      : JSON.parse(body)
  } catch (err) {
    console.error('Stripe webhook signature failed:', err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { metadata?: { order_id?: string } }
    const orderId = session.metadata?.order_id
    if (orderId) {
      const supabase = await createClient()
      await supabase.from('orders').update({ client_paid_at: new Date().toISOString() }).eq('id', orderId)

      const { data: o } = await supabase
        .from('orders')
        .select('client_company, confirmation_number, notary_id, notary_fee, notary_paid_at, notaries(name, phone, stripe_account_id, payouts_enabled)')
        .eq('id', orderId).single()

      if (process.env.ADMIN_PHONE && o) {
        sendSMS(process.env.ADMIN_PHONE, `💰 Paid online: ${o.client_company} for ${o.confirmation_number}. Auto-reconciled.`).catch(() => {})
      }

      // Client paid → auto-pay the notary into their connected account (cash-flow safe)
      const nRaw = o?.notaries as unknown
      const n = (Array.isArray(nRaw) ? nRaw[0] : nRaw) as { name: string; phone: string; stripe_account_id?: string; payouts_enabled?: boolean } | null
      if (o && o.notary_id && !o.notary_paid_at && n) {
        if (n.stripe_account_id && n.payouts_enabled) {
          const ok = await payoutNotary({
            stripeAccountId: n.stripe_account_id, amount: o.notary_fee,
            orderId, confirmationNumber: o.confirmation_number,
          })
          if (ok) {
            await supabase.from('orders').update({ notary_paid_at: new Date().toISOString() }).eq('id', orderId)
            sendSMS(n.phone, `💵 You've been paid $${(o.notary_fee / 100).toFixed(0)} for the ${o.confirmation_number} signing. It's on its way to your bank account. Thanks! — Inksent`).catch(() => {})
          } else if (process.env.ADMIN_PHONE) {
            sendSMS(process.env.ADMIN_PHONE, `⚠️ Auto-payout to ${n.name} failed for ${o.confirmation_number}. Check Stripe balance/account.`).catch(() => {})
          }
        } else if (process.env.ADMIN_PHONE) {
          sendSMS(process.env.ADMIN_PHONE, `⚠️ ${n.name} hasn't connected payouts — can't auto-pay for ${o.confirmation_number}. Nudge them to finish setup.`).catch(() => {})
        }
      }
    }
  }

  if (event.type === 'account.updated') {
    const acct = event.data.object as { id: string; payouts_enabled?: boolean }
    const supabase = await createClient()
    await supabase.from('notaries').update({ payouts_enabled: !!acct.payouts_enabled }).eq('stripe_account_id', acct.id)
  }

  return NextResponse.json({ received: true })
}
