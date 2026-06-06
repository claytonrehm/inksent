import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { blastOrderToCoveringNotaries } from '@/lib/dispatch'

// Admin releases a held (first-time-client) order — clears the hold and blasts.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  await supabase.from('orders').update({ hold_for_review: false }).eq('id', id)
  const { blastCount } = await blastOrderToCoveringNotaries(supabase, order)

  return NextResponse.json({ ok: true, blastCount })
}
