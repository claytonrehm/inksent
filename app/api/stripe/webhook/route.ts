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

  // Fail CLOSED: never trust an unsigned body. Without a configured secret + a
  // valid signature we reject — otherwise anyone could POST a forged
  // "checkout.session.completed" and mark orders paid / trigger real payouts.
  if (!secret || !sig) {
    console.error('Stripe webhook rejected: missing signature or STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'webhook signature required' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret)
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
            sendSMS(n.phone, `💵 Payment released: $${(o.notary_fee / 100).toFixed(0)} for the ${o.confirmation_number} signing — on its way to your bank account. Thanks! — Inksent`).catch(() => {})
          } else if (process.env.ADMIN_PHONE) {
            sendSMS(process.env.ADMIN_PHONE, `ℹ️ Payout to ${n.name} for ${o.confirmation_number} is queued — card funds usually take ~1–2 days to settle, then it auto-pays. No action needed unless it persists.`).catch(() => {})
          }
        } else {
          // Just-in-time payout: their money is waiting. Nudge THE NOTARY with the
          // strongest possible motivator — their pending pay + a connect link.
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
          if (n.phone) {
            sendSMS(n.phone, `💰 Your $${(o.notary_fee / 100).toFixed(0)} for the ${o.confirmation_number} signing is ready! Connect your bank to receive it — 2 min, deposit-only (we can't touch your account): ${baseUrl}/onboard/${o.notary_id}/connect`).catch(() => {})
          }
          if (process.env.ADMIN_PHONE) {
            sendSMS(process.env.ADMIN_PHONE, `ℹ️ ${n.name} completed ${o.confirmation_number} but hasn't connected payouts — we texted them their pending $${(o.notary_fee / 100).toFixed(0)} + connect link. Auto-pays once they connect.`).catch(() => {})
          }
        }
      }
    }
  }

  if (event.type === 'account.updated') {
    const acct = event.data.object as { id: string; payouts_enabled?: boolean }
    const supabase = await createClient()
    const nowEnabled = !!acct.payouts_enabled
    const { data: n } = await supabase
      .from('notaries')
      .select('name, payouts_enabled')
      .eq('stripe_account_id', acct.id)
      .single()
    await supabase.from('notaries').update({ payouts_enabled: nowEnabled }).eq('stripe_account_id', acct.id)
    // Notify ONCE, on the transition to payout-ready = fully onboarded & dispatchable
    if (n && nowEnabled && !n.payouts_enabled && process.env.ADMIN_PHONE) {
      sendSMS(process.env.ADMIN_PHONE, `✅ ${n.name} connected their bank — fully onboarded and ready for jobs!`).catch(() => {})
    }
  }

  return NextResponse.json({ received: true })
}
