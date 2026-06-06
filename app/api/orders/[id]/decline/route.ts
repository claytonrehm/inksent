import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { blastOrderToCoveringNotaries } from '@/lib/dispatch'
import { format } from 'date-fns'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id } = await req.json()

  const supabase = await createClient()

  const [orderResult, notaryResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('notaries').select('name').eq('id', notary_id).single(),
  ])

  if (orderResult.error || !orderResult.data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orderResult.data
  const notaryName = notaryResult.data?.name ?? 'Notary'

  // Was this notary the one on the hook (offered or already accepted)?
  const wasOnHook = order.notary_id === notary_id && ['dispatching', 'assigned', 'confirmed'].includes(order.status)
  const hadAccepted = order.notary_id === notary_id && ['assigned', 'confirmed'].includes(order.status)

  // Hours between now and the scheduled signing (negative if already past)
  const signingDateTime = new Date(`${order.signing_date}T${order.signing_time}`)
  const hoursBefore = Math.round(((signingDateTime.getTime() - Date.now()) / 3_600_000) * 10) / 10

  if (notary_id) {
    if (hadAccepted) {
      // A real cancellation — log it with timing, bump the cancel counter
      const { data: n } = await supabase.from('notaries').select('times_cancelled').eq('id', notary_id).single()
      await supabase.from('notaries').update({ times_cancelled: (n?.times_cancelled ?? 0) + 1 }).eq('id', notary_id)
      await supabase.from('notary_cancellations').insert({
        notary_id,
        order_id: id,
        hours_before_signing: hoursBefore,
        signer_name: order.signer_name,
        confirmation_number: order.confirmation_number,
      })
    } else {
      // Just declined an offer (never committed) — minor signal
      const { data: n } = await supabase.from('notaries').select('times_declined').eq('id', notary_id).single()
      await supabase.from('notaries').update({ times_declined: (n?.times_declined ?? 0) + 1 }).eq('id', notary_id)
    }
  }

  const h = parseInt(order.signing_time.split(':')[0])
  const m = order.signing_time.split(':')[1]
  const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
  const dateStr = format(new Date(order.signing_date), 'MMM d')

  let backupNote = ''
  if (wasOnHook) {
    // Accumulate everyone who has bailed on this order, so we never re-offer to them
    const declinedBy = Array.from(new Set([...(order.declined_by ?? []), notary_id]))
    await supabase.from('orders').update({ notary_id: null, status: 'pending', declined_by: declinedBy }).eq('id', id)

    // Re-blast to every covering notary who HASN'T bailed yet
    const { blastCount } = await blastOrderToCoveringNotaries(supabase, order, { exclude: declinedBy })
    backupNote = blastCount > 0
      ? ` Auto-reblasted to ${blastCount} remaining backup${blastCount === 1 ? '' : 's'} — first to accept wins.`
      : ` ⚠️ All ${declinedBy.length} covering notar${declinedBy.length === 1 ? 'y has' : 'ies have'} now passed — dispatch manually or recruit more coverage.`
  }

  if (process.env.ADMIN_PHONE) {
    const verb = hadAccepted ? 'CANCELLED' : 'declined'
    const flag = hadAccepted ? '🚨' : '⚠️'
    const timing = hadAccepted && hoursBefore >= 0
      ? ` (${hoursBefore < 24 ? `only ${hoursBefore}h` : `${Math.round(hoursBefore / 24)}d`} before signing)`
      : ''
    sendSMS(
      process.env.ADMIN_PHONE,
      `${flag} ${notaryName} ${verb} the ${dateStr} ${timeStr} signing for ${order.signer_name} in ${order.property_city}${timing}. Conf: ${order.confirmation_number}.${backupNote}`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
