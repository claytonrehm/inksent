import Stripe from 'stripe'

export function hasStripe() {
  return !!process.env.STRIPE_SECRET_KEY
}

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

// ─── Connect (notary payouts) ─────────────────────────────────────────────────

// Create (or reuse) a Stripe Express account for a notary and return an
// onboarding link they complete to enable payouts.
export async function createConnectOnboardingLink(notary: {
  id: string
  email: string
  stripe_account_id?: string | null
}): Promise<{ url: string; accountId: string } | null> {
  if (!hasStripe()) return null
  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'

  let accountId = notary.stripe_account_id
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: notary.email,
      // card_payments is requested alongside transfers so we don't need Stripe's
      // separate "transfers-without-card_payments" platform approval (which is in
      // internal review). Notaries only ever receive transfers; card_payments is
      // unused. Can revert to transfers-only once that approval lands.
      capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
      business_type: 'individual',
      metadata: { notary_id: notary.id },
    })
    accountId = account.id
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/onboard/${notary.id}/connect`,
    return_url: `${baseUrl}/onboard/${notary.id}/connect?done=1`,
    type: 'account_onboarding',
  })
  return { url: link.url, accountId }
}

// Pay a notary their fee into their connected account. Returns true on success.
export async function payoutNotary(params: {
  stripeAccountId: string
  amount: number
  orderId: string
  confirmationNumber: string
}): Promise<boolean> {
  if (!hasStripe()) return false
  try {
    const stripe = getStripe()
    await stripe.transfers.create({
      amount: params.amount,
      currency: 'usd',
      destination: params.stripeAccountId,
      metadata: { order_id: params.orderId, confirmation_number: params.confirmationNumber },
    })
    return true
  } catch (e) {
    console.error('Notary payout failed:', e)
    return false
  }
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
