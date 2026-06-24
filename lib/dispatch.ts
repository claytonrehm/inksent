import { sendSMS, buildDispatchMessage } from '@/lib/sms'
import { sendNotaryJobOfferEmail } from '@/lib/email'
import { notaryCoversZip } from '@/lib/coverage'
import { credentialsEligible } from '@/lib/credentials'
import { format } from 'date-fns'
import type { SupabaseClient } from '@supabase/supabase-js'

interface OrderRow {
  id: string
  signer_name: string
  signing_type: string
  signing_date: string
  signing_time: string
  property_address: string
  property_city: string
  property_zip: string
  notary_fee: number
  language_needed?: string | null
}

/**
 * Blast an order to active, ONBOARDED notaries whose coverage radius reaches the
 * property ZIP. If the order needs a specific language and any covering notary
 * speaks it, the blast is restricted to those. Excludes anyone who already bailed.
 */
export async function blastOrderToCoveringNotaries(
  supabase: SupabaseClient,
  order: OrderRow,
  opts: { exclude?: string[] } = {}
): Promise<{ blastCount: number; recipients: string[]; totalActive: number; notOnboarded: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const { data: notaries } = await supabase
    .from('notaries')
    .select('id, name, phone, email, base_zip, coverage_radius, onboarded_at, payouts_enabled, languages, nna_certified, nna_cert_expiry, background_checked, bgc_date, eo_carrier, eo_expiry, commission_expiry')
    .eq('active', true)

  const exclude = new Set(opts.exclude ?? [])
  const active = notaries ?? []
  // Only dispatch to credential-eligible agents — all four (NNA cert, background
  // check, E&O, commission) must be on file and not lapsed. A missing OR expired
  // credential takes them out of dispatch (we chase them to provide/renew it). An
  // agent inside the 30-day renewal window is still valid until the date, so they
  // keep receiving jobs while we chase the renewal. This keeps the "every agent
  // vetted & insured" promise true without shrinking the bench a month early.
  const credsValid = (n: Parameters<typeof credentialsEligible>[0]) => credentialsEligible(n)

  // Dispatch to agents who finished their profile + have valid credentials.
  // Bank connection is NOT required to receive jobs — we use "just-in-time"
  // payouts: once a job is done and the client pays, we nudge the agent to
  // connect their bank to claim the money waiting for them (strongest motivator),
  // and the cron auto-pays it the moment they connect. Money is held safely in
  // our Stripe balance until then — no manual payout, no loss.
  const eligible = active.filter(
    (n) => !exclude.has(n.id) && n.onboarded_at && credsValid(n) && notaryCoversZip(n.base_zip, n.coverage_radius, order.property_zip)
  )
  const notOnboarded = active.filter(
    (n) => !exclude.has(n.id) && !n.onboarded_at && notaryCoversZip(n.base_zip, n.coverage_radius, order.property_zip)
  ).length

  // Bilingual preference: if a language is needed and someone covering speaks it, restrict to them
  let covering = eligible
  if (order.language_needed) {
    const speakers = eligible.filter((n) => (n.languages ?? []).some(
      (l: string) => l.toLowerCase() === order.language_needed!.toLowerCase()
    ))
    if (speakers.length > 0) covering = speakers
  }

  let blastCount = 0
  if (covering.length > 0) {
    const dateLabel = format(new Date(order.signing_date), 'EEEE, MMM d')
    const [thh, tmm] = order.signing_time.split(':')
    const th = parseInt(thh)
    const timeLabel = `${th % 12 || 12}:${tmm} ${th < 12 ? 'AM' : 'PM'}`
    // Reach each covering notary by EMAIL and SMS. Email always works; SMS works
    // once A2P clears. A notary counts as reached if either channel succeeds —
    // so dispatch is fully operational even before Twilio A2P is approved.
    const results = await Promise.allSettled(
      covering.map(async (n) => {
        const acceptUrl = `${baseUrl}/accept/${order.id}?notary=${n.id}`
        const channels = await Promise.allSettled([
          n.email
            ? sendNotaryJobOfferEmail({
                notaryName: n.name.split(' ')[0],
                notaryEmail: n.email,
                signerName: order.signer_name,
                signingType: order.signing_type,
                signingDate: dateLabel,
                signingTime: timeLabel,
                propertyAddress: order.property_address,
                propertyCity: order.property_city,
                propertyZip: order.property_zip,
                fee: order.notary_fee,
                acceptUrl,
              })
            : Promise.reject(new Error('no email')),
          n.phone
            ? sendSMS(
                n.phone,
                buildDispatchMessage({
                  notaryName: n.name.split(' ')[0],
                  signerName: order.signer_name,
                  signingType: order.signing_type,
                  signingDate: dateLabel,
                  signingTime: timeLabel,
                  propertyAddress: order.property_address,
                  propertyCity: order.property_city,
                  propertyZip: order.property_zip,
                  fee: order.notary_fee,
                  acceptUrl,
                })
              )
            : Promise.reject(new Error('no phone')),
        ])
        if (channels.every((c) => c.status === 'rejected')) {
          throw new Error('all channels failed')
        }
        return true
      })
    )
    blastCount = results.filter((r) => r.status === 'fulfilled').length
    await supabase
      .from('orders')
      .update({ status: 'dispatching', notary_id: null, dispatched_to: covering.map((n) => n.id), dispatched_at: new Date().toISOString() })
      .eq('id', order.id)

    // Safety alert: we had eligible agents but reached NONE of them (every email +
    // SMS failed). Without this, a job silently sits unaccepted with no signal.
    if (blastCount === 0 && process.env.ADMIN_PHONE) {
      sendSMS(process.env.ADMIN_PHONE, `⚠️ Dispatch reached NO agents for ${order.signer_name}'s signing in ${order.property_zip} — ${covering.length} were eligible but all email/SMS failed. Check delivery + dispatch manually.`).catch(() => {})
    }
  }

  return { blastCount, recipients: covering.map((n) => n.id), totalActive: active.length, notOnboarded }
}
