import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS, buildDispatchMessage } from '@/lib/sms'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  // Send to all notaries — first to accept wins
  const results = await Promise.allSettled(
    notaries.map((notary) => {
      const acceptUrl = `${baseUrl}/accept/${order_id}?notary=${notary.id}`
      const message = buildDispatchMessage({
        notaryName: notary.name.split(' ')[0],
        signerName: order.signer_name,
        signingType: order.signing_type,
        signingDate: format(new Date(order.signing_date), 'EEEE, MMM d'),
        signingTime: order.signing_time,
        propertyAddress: order.property_address,
        propertyCity: order.property_city,
        propertyZip: order.property_zip,
        fee: order.notary_fee,
        acceptUrl,
      })
      return sendSMS(notary.phone, message)
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length

  // Mark order as dispatching, clear any prior notary, record who was blasted
  await supabase
    .from('orders')
    .update({
      status: 'dispatching',
      notary_id: null,
      dispatched_to: notary_ids,
    })
    .eq('id', order_id)

  return NextResponse.json({ ok: true, sent, total: notaries.length })
}
