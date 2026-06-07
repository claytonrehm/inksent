import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { sendPaymentReminderEmail } from '@/lib/invoice'
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

  // 2b. No-show / overdue: an assigned signing whose time has passed but isn't
  //     marked complete. Alert admin once + nudge the notary.
  const { data: maybeOverdue } = await supabase
    .from('orders')
    .select('id, confirmation_number, signer_name, signing_date, signing_time, notaries(name, phone)')
    .in('status', ['assigned', 'confirmed'])
    .lte('signing_date', today)
    .is('overdue_alerted_at', null)

  for (const o of maybeOverdue ?? []) {
    const when = new Date(`${o.signing_date}T${o.signing_time}`).getTime()
    if (now - when < 2 * 3600 * 1000) continue // give it 2h past the scheduled time
    const nRaw = o.notaries as unknown
    const n = (Array.isArray(nRaw) ? nRaw[0] : nRaw) as { name: string; phone: string } | null
    if (process.env.ADMIN_PHONE) {
      await sendSMS(
        process.env.ADMIN_PHONE,
        `🚨 OVERDUE: ${o.signer_name}'s signing (${o.confirmation_number}) was scheduled ${format(new Date(o.signing_date), 'MMM d')} but isn't marked complete. Assigned to ${n?.name ?? 'a notary'}. Check on it.`
      ).catch(() => {})
    }
    if (n?.phone) {
      await sendSMS(
        n.phone,
        `Hi ${(n.name ?? '').split(' ')[0]}, your ${o.signer_name} signing time has passed — please mark it complete or report a problem from your job link. Thanks! — Inksent`
      ).catch(() => {})
    }
    await supabase.from('orders').update({ overdue_alerted_at: new Date().toISOString() }).eq('id', o.id)
  }

  // 3. Auto-chase unpaid invoices so you never have to. Reminders at 7 & 14 days,
  //    final escalation to admin at 30 days.
  const { data: unpaid } = await supabase
    .from('orders')
    .select('id, invoice_id, confirmation_number, signing_type, signing_date, signer_name, client_name, client_email, client_company, client_fee, completed_at, payment_reminders')
    .eq('status', 'completed')
    .is('client_paid_at', null)
    .not('completed_at', 'is', null)

  let reminded = 0
  for (const o of unpaid ?? []) {
    const days = Math.floor((now - new Date(o.completed_at).getTime()) / 86_400_000)
    const sent = o.payment_reminders ?? 0
    let act: 'remind' | 'escalate' | null = null
    if (days >= 30 && sent < 3) act = 'escalate'
    else if (days >= 14 && sent < 2) act = 'remind'
    else if (days >= 7 && sent < 1) act = 'remind'
    if (!act) continue

    if (act === 'remind') {
      await sendPaymentReminderEmail({
        id: o.id, invoice_number: o.invoice_id, confirmation_number: o.confirmation_number,
        signing_type: o.signing_type, signing_date: o.signing_date, signer_name: o.signer_name,
        client_name: o.client_name, client_email: o.client_email, client_company: o.client_company,
        client_fee: o.client_fee, daysOverdue: days,
      }).catch(() => {})
    } else if (process.env.ADMIN_PHONE) {
      await sendSMS(process.env.ADMIN_PHONE, `🔴 Invoice ${o.invoice_id} (${o.client_company}, $${(o.client_fee / 100).toFixed(0)}) is ${days} days unpaid after 2 reminders. Time for a personal nudge.`).catch(() => {})
    }
    const next = days >= 30 ? 3 : days >= 14 ? 2 : 1
    await supabase.from('orders').update({ payment_reminders: next }).eq('id', o.id)
    reminded++
  }

  return NextResponse.json({ ok: true, alerted: toAlert.length, reminded })
}
