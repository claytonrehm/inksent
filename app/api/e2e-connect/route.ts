import { NextRequest, NextResponse } from 'next/server'
import { getStripe, hasStripe, createConnectOnboardingLink } from '@/lib/stripe'

// TEMPORARY: verifies Stripe Connect is enabled (the onboarding payout step).
// Creates a throwaway connected account, then deletes it. Delete this route after.
export async function GET(req: NextRequest) {
  if (!process.env.E2E_TEST_KEY || req.nextUrl.searchParams.get('key') !== process.env.E2E_TEST_KEY) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (!hasStripe()) return NextResponse.json({ hasStripe: false, connectWorks: false })

  try {
    const res = await createConnectOnboardingLink({ id: `connect-test-${Date.now()}`, email: 'clayton.rehm+connecttest@gmail.com' })
    let cleaned = false
    if (res?.accountId) {
      try { await getStripe().accounts.del(res.accountId); cleaned = true } catch { /* ignore */ }
    }
    return NextResponse.json({
      hasStripe: true,
      connectWorks: !!res?.url,
      onboardingLinkPrefix: res?.url?.slice(0, 45) ?? null,
      testAccountCleaned: cleaned,
    })
  } catch (e) {
    return NextResponse.json({ hasStripe: true, connectWorks: false, error: e instanceof Error ? e.message : String(e) })
  }
}
