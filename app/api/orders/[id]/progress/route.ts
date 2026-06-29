import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

// Notary-facing: the assigned notary reports a live milestone (on the way / arrived).
// The title company sees it update on the tracking page in real time.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id, milestone } = await req.json()
  if (!['en_route', 'arrived'].includes(milestone)) {
    return NextResponse.json({ error: 'Invalid milestone' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    // select('*') (not a named list) so this can't error if sms_consent_at hasn't
    // been migrated yet — the gating below just treats a missing value as "no consent".
    .select('*, notaries(name)')
    .eq('id', id)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.notary_id !== notary_id) {
    return NextResponse.json({ error: 'Not your assignment' }, { status: 403 })
  }

  const field = milestone === 'en_route' ? 'en_route_at' : 'arrived_at'
  await supabase.from('orders').update({ [field]: new Date().toISOString() }).eq('id', id)

  // Let the title company know (also visible live on the tracker)
  const nRaw = order.notaries as unknown
  const notary = (Array.isArray(nRaw) ? nRaw[0] : nRaw) as { name: string } | null
  const agent = notary?.name ?? 'Your signing agent'
  if (order.client_phone && order.sms_consent_at) {
    const msg = milestone === 'en_route'
      ? `🚗 ${agent} is on the way to ${order.signer_name}'s signing (${order.confirmation_number}). — Inksent`
      : `📍 ${agent} has arrived for ${order.signer_name}'s signing (${order.confirmation_number}). — Inksent`
    sendSMS(order.client_phone, msg).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
