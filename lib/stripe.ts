import Stripe from 'stripe'

export function hasStripe() {
  return !!process.env.STRIPE_SECRET_KEY
}

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

// True once a connected account can actually receive payouts. Used by the cron to
// catch notaries whose `account.updated` webhook was missed (so they don't stay
// stranded "bank pending" forever, blocking their just-in-time payout).
export async function accountPayoutsEnabled(accountId: string): Promise<boolean> {
  try {
    const acct = await getStripe().accounts.retrieve(accountId)
    return !!acct.payouts_enabled
  } catch {
    return false
  }
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
      // Requesting card_payments makes Stripe require a reachable business website.
      // Notaries don't have one, so we attach the platform URL (always reachable) +
      // a product description — otherwise every connected account gets flagged
      // "website couldn't be reached" and restricted.
      business_profile: {
        url: baseUrl,
        product_description: 'Independent mobile notary signing agent completing loan-document signings dispatched by Inksent.',
      },
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

// Refund a client's payment for an order (admin action). Finds the succeeded
// PaymentIntent by order metadata and refunds it in full.
export async function refundOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasStripe()) return { ok: false, error: 'Stripe not configured' }
  try {
    const stripe = getStripe()
    const res = await stripe.paymentIntents.search({
      query: `metadata['order_id']:'${orderId}' AND status:'succeeded'`,
      limit: 1,
    })
    const pi = res.data[0]
    if (!pi) return { ok: false, error: 'No completed payment found for this order to refund.' }
    await stripe.refunds.create({ payment_intent: pi.id })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Refund failed' }
  }
}

// Safety net: did Stripe actually receive a succeeded payment for this order?
// Lets us recover a missed/failed webhook so we never dun a client who already paid.
export async function orderWasPaid(orderId: string): Promise<boolean> {
  if (!hasStripe()) return false
  try {
    const stripe = getStripe()
    const res = await stripe.paymentIntents.search({
      query: `metadata['order_id']:'${orderId}' AND status:'succeeded'`,
      limit: 1,
    })
    return res.data.length > 0
  } catch (e) {
    console.error('Stripe payment reconciliation search failed:', e)
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
      // Also stamp the order id on the resulting PaymentIntent so we can reconcile
      // a missed webhook by searching Stripe for a succeeded payment.
      payment_intent_data: { metadata: { order_id: order.id, confirmation_number: order.confirmation_number } },
      after_completion: { type: 'hosted_confirmation' },
    })
    return link.url
  } catch (e) {
    console.error('Stripe payment link failed:', e)
    return null
  }
}
