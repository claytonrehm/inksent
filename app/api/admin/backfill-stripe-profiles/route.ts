import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getStripe, hasStripe } from '@/lib/stripe'

// One-time (re-runnable) backfill: set business_profile.url + product_description on
// every notary's existing Stripe connected account, so Stripe stops flagging
// "website couldn't be reached" and restricting payouts. Admin-gated; visit while
// signed in as admin: /api/admin/backfill-stripe-profiles
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasStripe()) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const stripe = getStripe()
  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('id, name, stripe_account_id')
    .not('stripe_account_id', 'is', null)

  const results: { name: string; ok: boolean; error?: string }[] = []
  for (const n of notaries ?? []) {
    try {
      await stripe.accounts.update(n.stripe_account_id as string, {
        business_profile: {
          url: baseUrl,
          product_description: 'Independent mobile notary signing agent completing loan-document signings dispatched by Inksent.',
        },
      })
      results.push({ name: n.name, ok: true })
    } catch (e) {
      results.push({ name: n.name, ok: false, error: (e as Error).message })
    }
  }

  return NextResponse.json({
    updated: results.filter((r) => r.ok).length,
    total: results.length,
    results,
  })
}
