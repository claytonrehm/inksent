import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { sendSMS, buildDispatchMessage } from '@/lib/sms'
import { sendNotaryJobOfferEmail } from '@/lib/email'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { order_id, notary_ids } = await req.json()

  if (!order_id || !Array.isArray(notary_ids) || notary_ids.length === 0) {
    return NextResponse.json({ error: 'order_id and notary_ids required' }, { status: 400 })
  }

  const supabase = await createClient()

  const [orderResult, notariesResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', order_id).single(),
    supabase.from('notaries').select('*').in('id', notary_ids),
  ])

  if (orderResult.error || !orderResult.data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orderResult.data
  const notaries = notariesResult.data ?? []
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const [bh, bm] = order.signing_time.split(':')
  const timeLabel = `${parseInt(bh) % 12 || 12}:${bm} ${parseInt(bh) < 12 ? 'AM' : 'PM'}`
  const dateLabel = format(new Date(order.signing_date), 'EEEE, MMM d')

  // Send to all notaries by email AND SMS — first to accept wins, and a notary
  // counts as reached if either channel lands (so it works pre-A2P too).
  const results = await Promise.allSettled(
    notaries.map(async (notary) => {
      const acceptUrl = `${baseUrl}/accept/${order_id}?notary=${notary.id}`
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
        notary.phone ? sendSMS(notary.phone, message) : Promise.reject(new Error('no phone')),
      ])
      if (channels.every((c) => c.status === 'rejected')) throw new Error('unreachable')
      return true
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length

  // Mark order as dispatching, clear any prior notary, record who was blasted +
  // stamp dispatched_at so it escalates if nobody accepts.
  await supabase
    .from('orders')
    .update({
      status: 'dispatching',
      notary_id: null,
      dispatched_to: notary_ids,
      dispatched_at: new Date().toISOString(),
    })
    .eq('id', order_id)

  return NextResponse.json({ ok: true, sent, total: notaries.length })
}
