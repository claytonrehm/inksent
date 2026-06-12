import { getStripe, hasStripe } from './stripe'

/**
 * Hub subscription plans. Price IDs come from env (created once via
 * `scripts/setup-hub-billing.ts`). Amounts here are display-only.
 */
export const HUB_PLANS = {
  monthly: {
    label: 'Monthly',
    priceId: process.env.STRIPE_HUB_PRICE_MONTHLY,
    amountLabel: '$12',
    period: '/mo',
  },
  annual: {
    label: 'Annual',
    priceId: process.env.STRIPE_HUB_PRICE_ANNUAL,
    amountLabel: '$99',
    period: '/yr',
    note: 'Save ~30% — about $8.25/mo',
  },
} as const

export type HubPlan = keyof typeof HUB_PLANS

export const HUB_TRIAL_DAYS = 14

/** Billing is available only when Stripe + both price IDs are configured. */
export function hasHubBilling(): boolean {
  return hasStripe() && !!HUB_PLANS.monthly.priceId && !!HUB_PLANS.annual.priceId
}

/** Create a Checkout Session for a Hub subscription (with free trial). */
export async function createHubCheckout(params: {
  plan: HubPlan
  hubUserId: string
  email: string
  customerId: string | null
  origin: string
}): Promise<string | null> {
  const plan = HUB_PLANS[params.plan]
  if (!plan.priceId) return null
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    ...(params.customerId ? { customer: params.customerId } : { customer_email: params.email }),
    subscription_data: {
      trial_period_days: HUB_TRIAL_DAYS,
      metadata: { hub_user_id: params.hubUserId },
    },
    metadata: { kind: 'hub_subscription', hub_user_id: params.hubUserId, plan: params.plan },
    allow_promotion_codes: true,
    success_url: `${params.origin}/hub?welcome=1`,
    cancel_url: `${params.origin}/hub/subscribe`,
  })
  return session.url
}

/** Stripe Billing Portal so subscribers can manage/cancel their plan. */
export async function createHubBillingPortal(params: {
  customerId: string
  origin: string
}): Promise<string | null> {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: `${params.origin}/hub`,
  })
  return session.url
}
