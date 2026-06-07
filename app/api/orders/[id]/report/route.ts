import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

// Notary-facing: the assigned notary flags a signing they couldn't complete
// (signer no-show, ID issue, missing docs, etc.) so the admin can step in —
// instead of the order silently going nowhere.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id, reason, notes } = await req.json()

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('notary_id, signer_name, confirmation_number, client_company, notaries(name)')
    .eq('id', id)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.notary_id !== notary_id) {
    return NextResponse.json({ error: 'Not your assignment' }, { status: 403 })
  }

  const detail = [reason, notes].filter(Boolean).join(' — ') || 'Issue reported'
  await supabase.from('orders').update({
    issue_reported_at: new Date().toISOString(),
    issue_reason: detail,
  }).eq('id', id)

  const nRaw = order.notaries as unknown
  const notary = (Array.isArray(nRaw) ? nRaw[0] : nRaw) as { name: string } | null
  if (process.env.ADMIN_PHONE) {
    sendSMS(
      process.env.ADMIN_PHONE,
      `⚠️ ISSUE on ${order.confirmation_number} (${order.signer_name} · ${order.client_company}) from ${notary?.name ?? 'notary'}: ${detail}. Step in ASAP.`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
