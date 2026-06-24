import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createClient()

  // Guard: don't re-mark an already-paid order (would move the commission anchor)
  // and never mark a refunded order as paid (would re-arm the notary auto-payout).
  const { data: order } = await supabase
    .from('orders')
    .select('client_paid_at, refunded_at')
    .eq('id', id)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.refunded_at) return NextResponse.json({ error: 'Order was refunded — cannot mark paid.' }, { status: 400 })
  if (order.client_paid_at) return NextResponse.json({ ok: true, already: true })

  const { error } = await supabase
    .from('orders')
    .update({ client_paid_at: new Date().toISOString() })
    .eq('id', id)
    .is('client_paid_at', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
