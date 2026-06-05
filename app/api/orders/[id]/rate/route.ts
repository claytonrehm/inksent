import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id, rating, on_time, docs_complete, professional, notes } = await req.json()

  const supabase = await createClient()

  await supabase.from('notary_ratings').upsert({
    order_id: id,
    notary_id,
    rating,
    on_time,
    docs_complete,
    professional,
    notes,
  }, { onConflict: 'order_id' })

  return NextResponse.json({ ok: true })
}
