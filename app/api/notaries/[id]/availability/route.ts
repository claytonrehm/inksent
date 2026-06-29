import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// The four coarse availability windows captured at apply — the only valid values.
// Mirror of the labels in NotaryApplyForm so a tampered client can't write junk.
const VALID = new Set(['weekday_day', 'weekday_evening', 'weekends', 'same_day'])

// Notary-facing: the [id] in the URL is the notary's unguessable UUID, which acts
// as the capability token (same pattern as accept/decline/onboard). NOT admin-gated.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = await req.json().catch(() => ({}))

  const availability = Array.isArray(d.availability)
    ? [...new Set(d.availability.filter((v: unknown) => typeof v === 'string' && VALID.has(v)))]
    : []

  const supabase = await createClient()
  const { error } = await supabase.from('notaries').update({ availability }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
