import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { format } from 'date-fns'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id } = await req.json()

  const supabase = await createClient()

  const [orderResult, notaryResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('notaries').select('name, phone').eq('id', notary_id).single(),
  ])

  if (orderResult.error || !orderResult.data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orderResult.data
  const notary = notaryResult.data

  if (order.notary_id && order.notary_id !== notary_id) {
    return NextResponse.json({ error: 'Already assigned to another notary' }, { status: 409 })
  }

  await supabase
    .from('orders')
    .update({ notary_id, status: 'assigned' })
    .eq('id', id)

  // Notify admin
  if (process.env.ADMIN_PHONE && notary) {
    const h = parseInt(order.signing_time.split(':')[0])
    const m = order.signing_time.split(':')[1]
    const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`

    await sendSMS(
      process.env.ADMIN_PHONE,
      `✓ ${notary.name} accepted the ${format(new Date(order.signing_date), 'MMM d')} ${timeStr} signing for ${order.signer_name} in ${order.property_city}. Conf: ${order.confirmation_number}`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
