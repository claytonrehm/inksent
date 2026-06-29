import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { sendSMS, buildDispatchMessage } from '@/lib/sms'
import { sendNotaryJobOfferEmail } from '@/lib/email'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { order_id, notary_id } = await req.json()

  if (!order_id || !notary_id) {
    return NextResponse.json({ error: 'order_id and notary_id required' }, { status: 400 })
  }

  const supabase = await createClient()

  const [orderResult, notaryResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', order_id).single(),
    supabase.from('notaries').select('*').eq('id', notary_id).single(),
  ])

  if (orderResult.error || !orderResult.data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (notaryResult.error || !notaryResult.data) {
    return NextResponse.json({ error: 'Notary not found' }, { status: 404 })
  }

  const order = orderResult.data
  const notary = notaryResult.data

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const acceptUrl = `${baseUrl}/accept/${order_id}?notary=${notary_id}`
  const [dh, dm] = order.signing_time.split(':')
  const timeLabel = `${parseInt(dh) % 12 || 12}:${dm} ${parseInt(dh) < 12 ? 'AM' : 'PM'}`
  const dateLabel = format(new Date(order.signing_date), 'EEEE, MMM d')

  const message = buildDispatchMessage({
    notaryName: notary.name.split(' ')[0],
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

  // Reach the notary by email AND SMS — succeeds if either lands (works pre-A2P).
  const channels = await Promise.allSettled([
    notary.email
      ? sendNotaryJobOfferEmail({
          notaryName: notary.name.split(' ')[0], notaryEmail: notary.email,
          signerName: order.signer_name, signingType: order.signing_type,
          signingDate: dateLabel, signingTime: timeLabel,
          propertyAddress: order.property_address, propertyCity: order.property_city,
          propertyZip: order.property_zip, fee: order.notary_fee, acceptUrl,
        })
      : Promise.reject(new Error('no email')),
    notary.phone && notary.sms_consent_at ? sendSMS(notary.phone, message) : Promise.reject(new Error('no phone/SMS consent')),
  ])
  if (channels.every((c) => c.status === 'rejected')) {
    return NextResponse.json({ error: 'Could not reach this notary by email or SMS.' }, { status: 502 })
  }

  // Offer it (don't pre-assign): they claim it via the accept link, so it escalates
  // if unaccepted and the atomic claim still applies.
  const { error } = await supabase
    .from('orders')
    .update({ status: 'dispatching', notary_id: null, dispatched_to: [notary_id], dispatched_at: new Date().toISOString() })
    .eq('id', order_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
