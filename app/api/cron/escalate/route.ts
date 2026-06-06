import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { format } from 'date-fns'

// Runs on a schedule (see vercel.json). Surfaces orders that need a human:
//  - blasted 30+ min ago with no acceptance
//  - signing within 48h still unassigned
// Alerts the admin ONCE per order (escalated_at), so you can step in instead of
// finding out from an angry client.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const now = Date.now()
  const staleCutoff = new Date(now - 30 * 60 * 1000).toISOString()
  const today = new Date().toISOString().split('T')[0]
  const in48 = new Date(now + 48 * 3600 * 1000).toISOString().split('T')[0]

  // 1. Blasted but nobody accepted in 30+ min
  const { data: stale } = await supabase
    .from('orders')
    .select('id, confirmation_number, signer_name, property_city, property_zip, signing_date')
    .eq('status', 'dispatching')
    .is('notary_id', null)
    .lt('dispatched_at', staleCutoff)
    .is('escalated_at', null)

  // 2. Upcoming signing still has no assigned notary
  const { data: upcoming } = await supabase
    .from('orders')
    .select('id, confirmation_number, signer_name, property_city, property_zip, signing_date, status')
    .in('status', ['pending', 'dispatching'])
    .is('notary_id', null)
    .gte('signing_date', today)
    .lte('signing_date', in48)
    .is('escalated_at', null)

  const seen = new Set<string>()
  const toAlert = [...(stale ?? []), ...(upcoming ?? [])].filter((o) => {
    if (seen.has(o.id)) return false
    seen.add(o.id)
    return true
  })

  for (const o of toAlert) {
    const isStale = (stale ?? []).some((s) => s.id === o.id)
    const msg = isStale
      ? `⏰ No one has accepted ${o.signer_name}'s signing (${o.confirmation_number}) — blasted 30+ min ago in ${o.property_zip}. Widen coverage or dispatch manually.`
      : `⏰ Upcoming signing for ${o.signer_name} on ${format(new Date(o.signing_date), 'MMM d')} (${o.confirmation_number}) is still UNASSIGNED. Needs attention.`
    if (process.env.ADMIN_PHONE) await sendSMS(process.env.ADMIN_PHONE, msg).catch(() => {})
    await supabase.from('orders').update({ escalated_at: new Date().toISOString() }).eq('id', o.id)
  }

  return NextResponse.json({ ok: true, alerted: toAlert.length })
}
