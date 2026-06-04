import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS, buildDispatchMessage } from '@/lib/sms'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const acceptUrl = `${baseUrl}/notary/accept/${order_id}?notary=${notary_id}`

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

  try {
    await sendSMS(notary.phone, message)
  } catch (err) {
    console.error('SMS send failed:', err)
    return NextResponse.json({ error: 'SMS delivery failed' }, { status: 500 })
  }

  const { error } = await supabase
    .from('orders')
    .update({ notary_id, status: 'dispatching' })
    .eq('id', order_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, sms_sent_to: notary.phone })
}
