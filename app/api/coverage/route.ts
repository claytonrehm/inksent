import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { lookupZip, notaryCoversZip } from '@/lib/coverage'
import { fullyCredentialed } from '@/lib/credentials'

// Public: is a property ZIP within reach of our active, onboarded agents? Returns
// an honest coverage signal (count + availability windows) so clients know what we
// can actually staff before they order. No notary PII is returned.
export async function GET(req: NextRequest) {
  const zip = (req.nextUrl.searchParams.get('zip') ?? '').trim()
  const info = lookupZip(zip)
  if (!info) return NextResponse.json({ found: false })

  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('base_zip, coverage_radius, availability, nna_certified, nna_cert_expiry, background_checked, bgc_date, eo_carrier, eo_expiry, commission_expiry')
    .eq('active', true)
    .not('onboarded_at', 'is', null)

  // Only fully vetted & verified agents (all four credentials green) count toward
  // the coverage we advertise — never claim coverage we can't actually staff.
  const covering = (notaries ?? [])
    .filter((n) => fullyCredentialed(n))
    .filter((n) => notaryCoversZip(n.base_zip, n.coverage_radius, zip))
  const has = (k: string) => covering.some((n) => Array.isArray(n.availability) && n.availability.includes(k))

  return NextResponse.json({
    found: true,
    city: info.city,
    state: info.state,
    agentCount: covering.length,
    covered: covering.length > 0,
    sameDay: has('same_day'),
    weekends: has('weekends'),
    evenings: has('weekday_evening'),
  })
}
