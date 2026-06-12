import { NextRequest, NextResponse } from 'next/server'
import { getSessionEmail, findHubUser } from '@/lib/hub-server'
import { createHubBillingPortal, hasHubBilling } from '@/lib/hub-billing'

export async function POST(req: NextRequest) {
  if (!hasHubBilling()) return NextResponse.json({ error: 'billing not configured' }, { status: 400 })

  const email = await getSessionEmail()
  if (!email) return NextResponse.json({ error: 'not signed in' }, { status: 401 })

  const hubUser = await findHubUser(email)
  if (!hubUser?.stripe_customer_id) return NextResponse.json({ error: 'no subscription' }, { status: 400 })

  const url = await createHubBillingPortal({
    customerId: hubUser.stripe_customer_id,
    origin: new URL(req.url).origin,
  })
  if (!url) return NextResponse.json({ error: 'could not open portal' }, { status: 500 })
  return NextResponse.json({ url })
}
