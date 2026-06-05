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
    supabase.from('notaries').select('name').eq('id', notary_id).single(),
  ])

  if (orderResult.error || !orderResult.data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orderResult.data
  const notaryName = notaryResult.data?.name ?? 'Notary'

  // Track the decline against this notary (engagement / reliability signal)
  if (notary_id) {
    const { data: n } = await supabase.from('notaries').select('times_declined').eq('id', notary_id).single()
    await supabase
      .from('notaries')
      .update({ times_declined: (n?.times_declined ?? 0) + 1 })
      .eq('id', notary_id)
  }

  // Only reset if this notary was the dispatched one
  if (order.notary_id === notary_id && order.status === 'dispatching') {
    await supabase
      .from('orders')
      .update({ notary_id: null, status: 'pending' })
      .eq('id', id)
  }

  if (process.env.ADMIN_PHONE) {
    const h = parseInt(order.signing_time.split(':')[0])
    const m = order.signing_time.split(':')[1]
    const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`

    sendSMS(
      process.env.ADMIN_PHONE,
      `⚠️ ${notaryName} declined the ${format(new Date(order.signing_date), 'MMM d')} ${timeStr} signing for ${order.signer_name} in ${order.property_city}. Conf: ${order.confirmation_number} — needs reassignment.`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
