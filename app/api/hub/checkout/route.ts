import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionEmail, upsertHubUser } from '@/lib/hub-server'
import { createHubCheckout, hasHubBilling, HUB_PLANS } from '@/lib/hub-billing'

const schema = z.object({
  plan: z.enum(['monthly', 'annual']),
  name: z.string().trim().min(1).max(120).optional(),
  baseZip: z.string().regex(/^\d{5}$/).optional(),
})

export async function POST(req: NextRequest) {
  if (!hasHubBilling()) return NextResponse.json({ error: 'billing not configured' }, { status: 400 })

  const email = await getSessionEmail()
  if (!email) return NextResponse.json({ error: 'not signed in' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })
  const { plan, name, baseZip } = parsed.data

  if (!HUB_PLANS[plan].priceId) return NextResponse.json({ error: 'plan unavailable' }, { status: 400 })

  // Save profile (name/base ZIP) and ensure a hub_user exists before checkout.
  const hubUser = await upsertHubUser(email, {
    ...(name ? { name } : {}),
    ...(baseZip ? { base_zip: baseZip } : {}),
  })

  const url = await createHubCheckout({
    plan,
    hubUserId: hubUser.id,
    email,
    customerId: hubUser.stripe_customer_id,
    origin: new URL(req.url).origin,
  })
  if (!url) return NextResponse.json({ error: 'could not start checkout' }, { status: 500 })
  return NextResponse.json({ url })
}
