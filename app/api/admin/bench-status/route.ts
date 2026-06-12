import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { credentialItems, credentialsEligible, fullyCredentialed } from '@/lib/credentials'

// Admin-gated bench readiness snapshot. Visit while signed in as admin:
// /api/admin/bench-status — shows each active notary's credential status, whether
// they're onboarded + bank-connected, all-green, and dispatch-ready.
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('name, active, onboarded_at, payouts_enabled, base_zip, coverage_radius, nna_certified, nna_cert_expiry, background_checked, bgc_date, eo_carrier, eo_expiry, commission_expiry')
    .eq('active', true)

  const agents = (notaries ?? []).map((n) => {
    const items = credentialItems(n)
    const credentials = Object.fromEntries(items.map((c) => [c.short, c.status]))
    return {
      name: (n.name ?? '').trim(),
      base_zip: n.base_zip,
      onboarded: !!n.onboarded_at,
      bankConnected: !!n.payouts_enabled,
      credentials, // { NNA, BG, E&O, COM }
      allGreen: fullyCredentialed(n),
      dispatchReady: !!(n.active && n.onboarded_at && credentialsEligible(n)),
    }
  })

  return NextResponse.json({
    activeCount: agents.length,
    dispatchReady: agents.filter((a) => a.dispatchReady).length,
    allGreen: agents.filter((a) => a.allGreen).length,
    agents,
  })
}
