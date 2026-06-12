/**
 * One-time setup: creates the Notary Hub subscription product + monthly/annual
 * prices in Stripe, then prints the price IDs to add to your env.
 *
 * Run:  npx tsx --env-file=.env.local scripts/setup-hub-billing.ts
 *
 * Re-running is safe-ish but will create NEW prices each time — run once, then
 * paste the printed IDs into STRIPE_HUB_PRICE_MONTHLY / STRIPE_HUB_PRICE_ANNUAL.
 */
import Stripe from 'stripe'

async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.error('✗ STRIPE_SECRET_KEY not set. Run with: npx tsx --env-file=.env.local scripts/setup-hub-billing.ts')
    process.exit(1)
  }
  const stripe = new Stripe(key)

  const product = await stripe.products.create({
    name: 'Inksent Notary Hub',
    description: 'Earnings dashboard, payment tracking, and tax-ready mileage reports for notary signing agents.',
  })

  const monthly = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: 1200,
    recurring: { interval: 'month' },
    nickname: 'Notary Hub — Monthly',
  })

  const annual = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: 9900,
    recurring: { interval: 'year' },
    nickname: 'Notary Hub — Annual',
  })

  console.log('\n✓ Created Stripe product + prices. Add these to .env.local (and Vercel):\n')
  console.log(`STRIPE_HUB_PRICE_MONTHLY=${monthly.id}`)
  console.log(`STRIPE_HUB_PRICE_ANNUAL=${annual.id}`)
  console.log(`\n(product: ${product.id})\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
