import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { sendPaymentReminderEmail } from '@/lib/invoice'
import { sendNotaryApprovedEmail } from '@/lib/email'
import { chaseCredentials } from '@/lib/credential-chase'
import { orderWasPaid, payoutNotary, hasStripe } from '@/lib/stripe'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/admin'
import { format } from 'date-fns'

// Runs on a schedule (see vercel.json). Surfaces orders that need a human:
//  - blasted 30+ min ago with no acceptance
//  - signing within 48h still unassigned
// Alerts the admin ONCE per order (escalated_at), so you can step in instead of
// finding out from an angry client.
export async function GET(req: NextRequest) {
  // Fail CLOSED: if the secret is unset we reject rather than run unauthenticated.
  // This endpoint sends SMS, moves money (payout retries), and purges documents —
  // it must never be publicly triggerable.
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
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

  // 2b-2. ONBOARDING NUDGE — approved notaries who never finished their profile are
  //   the biggest mid-funnel leak (they sit "approved" but undispatchable). Re-send the
  //   approval SMS + email a few times, spaced out: first ~1 day after approval, then
  //   every ~2 days, up to 3 nudges. nudge_count/nudged_at prevent spamming each run.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const oneDayAgo = new Date(now - 86_400_000).toISOString()
  const twoDaysAgo = new Date(now - 2 * 86_400_000).toISOString()
  const { data: stalledNotaries } = await supabase
    .from('notaries')
    .select('id, name, phone, email, approved_at, nudged_at, nudge_count')
    .eq('active', true)
    .is('onboarded_at', null)
    .not('approved_at', 'is', null)
    .lt('nudge_count', 3)
  let nudged = 0
  for (const n of stalledNotaries ?? []) {
    const neverNudged = !n.nudged_at
    const due = neverNudged ? n.approved_at < oneDayAgo : n.nudged_at < twoDaysAgo
    if (!due) continue
    const onboardUrl = `${baseUrl}/onboard/${n.id}`
    const firstName = (n.name ?? '').split(' ')[0]
    if (n.phone) {
      await sendSMS(
        n.phone,
        `Hi ${firstName}, you're approved with Inksent but haven't finished your quick profile yet — it's the last step before we can text you signing jobs ($90 each). Takes ~3 min: ${onboardUrl} — Clayton`
      ).catch(() => {})
    }
    if (n.email) {
      await sendNotaryApprovedEmail({ name: n.name, email: n.email, onboardUrl }).catch(() => {})
    }
    await supabase.from('notaries').update({ nudged_at: new Date().toISOString(), nudge_count: (n.nudge_count ?? 0) + 1 }).eq('id', n.id)
    nudged++
  }

  // 2b-3. CREDENTIAL CHASE — keep the whole bench at four green checks automatically.
  //   For every active notary, request any of the four credentials that are missing
  //   or expiring (NNA cert, background check, E&O, commission) via one combined
  //   SMS + email with an update link. Throttled to ~every 14 days. Shared with the
  //   admin "send now" button.
  const credRemind = await chaseCredentials(supabase, { baseUrl, throttleMs: 14 * 86_400_000, adminPhone: process.env.ADMIN_PHONE })

  // 2c. MONEY SAFETY NET — runs BEFORE dunning so we never chase a paid client.
  //   (i)  Recover a payment whose webhook was missed (reconcile from Stripe).
  //   (ii) Retry a payout that failed earlier (e.g. card funds hadn't settled yet).
  if (hasStripe()) {
    // (i) Reconcile: completed + unpaid + invoiced, but Stripe shows a succeeded payment
    const { data: unconfirmed } = await supabase
      .from('orders')
      .select('id, confirmation_number, client_company')
      .eq('status', 'completed')
      .is('client_paid_at', null)
      .not('invoice_id', 'is', null)
    for (const o of unconfirmed ?? []) {
      if (await orderWasPaid(o.id)) {
        await supabase.from('orders').update({ client_paid_at: new Date().toISOString() }).eq('id', o.id)
        if (process.env.ADMIN_PHONE) {
          await sendSMS(process.env.ADMIN_PHONE, `✅ Recovered a missed payment: ${o.confirmation_number} (${o.client_company}) is actually PAID. Reconciled — paying the notary now.`).catch(() => {})
        }
      }
    }

    // (ii) Retry payouts: client paid, notary not paid yet, notary connected
    const { data: toPay } = await supabase
      .from('orders')
      .select('id, confirmation_number, notary_id, notary_fee, notary_paid_at, notaries(name, phone, stripe_account_id, payouts_enabled)')
      .not('client_paid_at', 'is', null)
      .is('notary_paid_at', null)
      .not('notary_id', 'is', null)
    for (const o of toPay ?? []) {
      const nRaw = o.notaries as unknown
      const n = (Array.isArray(nRaw) ? nRaw[0] : nRaw) as { name: string; phone: string; stripe_account_id?: string; payouts_enabled?: boolean } | null
      if (!n) continue
      if (n.stripe_account_id && n.payouts_enabled) {
        const ok = await payoutNotary({ stripeAccountId: n.stripe_account_id, amount: o.notary_fee, orderId: o.id, confirmationNumber: o.confirmation_number })
        if (ok) {
          await supabase.from('orders').update({ notary_paid_at: new Date().toISOString() }).eq('id', o.id)
          if (n.phone) await sendSMS(n.phone, `💵 Payment released: $${(o.notary_fee / 100).toFixed(0)} for the ${o.confirmation_number} signing — on its way to your bank account. Thanks! — Inksent`).catch(() => {})
        } else if (process.env.ADMIN_PHONE) {
          await sendSMS(process.env.ADMIN_PHONE, `⚠️ Payout to ${n.name} for ${o.confirmation_number} is still failing — check your Stripe balance/their account. Auto-retries daily.`).catch(() => {})
        }
      } else if (process.env.ADMIN_PHONE) {
        await sendSMS(process.env.ADMIN_PHONE, `⚠️ ${n?.name ?? 'A notary'} completed ${o.confirmation_number} but isn't payout-connected — nudge them to finish Stripe so they get paid.`).catch(() => {})
      }
    }
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

  // 4. DOCUMENT RETENTION — purge borrower loan packages 14 days after completion.
  //    Aligns with signing-industry practice (NNA: destroy borrower docs promptly)
  //    + GLBA/CCPA data minimization, with a buffer for redraws/funding/disputes.
  //    The order record + timestamps remain as the audit trail; only the sensitive
  //    files are deleted. (Tune RETENTION_DAYS to 7 for a stricter privacy posture.)
  const RETENTION_DAYS = 14
  let purged = 0
  if (hasServiceRole()) {
    const purgeCutoff = new Date(now - RETENTION_DAYS * 86_400_000).toISOString()
    const { data: toPurge } = await supabase
      .from('orders')
      .select('id, documents, scan_backs')
      .eq('status', 'completed')
      .lt('completed_at', purgeCutoff)
    const admin = createAdminClient()
    for (const o of toPurge ?? []) {
      const docs = (o.documents as { path?: string }[]) ?? []
      const scans = (o.scan_backs as { path?: string }[]) ?? []
      const paths = [...docs, ...scans].map((d) => d?.path).filter(Boolean) as string[]
      if (paths.length === 0) continue
      await admin.storage.from('signing-docs').remove(paths).catch(() => {})
      await supabase.from('orders').update({ documents: [], scan_backs: [] }).eq('id', o.id)
      purged++
    }
  }

  return NextResponse.json({ ok: true, alerted: toAlert.length, nudged, credRemind, reminded, purged })
}
