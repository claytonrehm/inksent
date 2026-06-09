import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Public health check for uptime monitoring (UptimeRobot, Better Stack, etc.).
// Returns 503 if the database is unreachable so monitors alert. No secrets leaked.
export async function GET() {
  const checks: Record<string, boolean> = {}
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('orders').select('id', { head: true, count: 'exact' })
    checks.database = !error
  } catch {
    checks.database = false
  }
  checks.payments = !!process.env.STRIPE_SECRET_KEY
  checks.email = !!process.env.RESEND_API_KEY

  const ok = checks.database
  return NextResponse.json(
    { ok, time: new Date().toISOString(), checks },
    { status: ok ? 200 : 503 },
  )
}
