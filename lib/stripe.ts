import Stripe from 'stripe'

export function hasStripe() {
  return !!process.env.STRIPE_SECRET_KEY
}

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

// Create a (non-expiring) payment link for an invoice, tagged with the order id
// so the webhook can auto-mark it paid. Returns null if Stripe isn't configured.
export async function createInvoicePaymentLink(order: {
  id: string
  confirmation_number: string
  client_fee: number
  client_company: string
}): Promise<string | null> {
  if (!hasStripe()) return null
  try {
    const stripe = getStripe()
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: order.client_fee,
      product_data: { name: `Signing service — ${order.confirmation_number}` },
    })
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { order_id: order.id, confirmation_number: order.confirmation_number },
      after_completion: { type: 'hosted_confirmation' },
    })
    return link.url
  } catch (e) {
    console.error('Stripe payment link failed:', e)
    return null
  }
}
