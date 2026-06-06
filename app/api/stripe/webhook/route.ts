import { NextRequest, NextResponse } from 'next/server'
import { getStripe, hasStripe } from '@/lib/stripe'
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
    const session = event.data.object as { metadata?: { order_id?: string }; amount_total?: number }
    const orderId = session.metadata?.order_id
    if (orderId) {
      const supabase = await createClient()
      await supabase.from('orders').update({ client_paid_at: new Date().toISOString() }).eq('id', orderId)
      const { data: o } = await supabase.from('orders').select('client_company, confirmation_number').eq('id', orderId).single()
      if (process.env.ADMIN_PHONE && o) {
        sendSMS(process.env.ADMIN_PHONE, `💰 Paid online: ${o.client_company} for ${o.confirmation_number}. Auto-reconciled.`).catch(() => {})
      }
    }
  }

  return NextResponse.json({ received: true })
}
