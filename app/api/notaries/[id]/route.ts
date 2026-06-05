import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const supabase = await createClient()

  // Get current notary state to detect approval
  const { data: before } = await supabase.from('notaries').select('active, name, phone').eq('id', id).single()

  const { error } = await supabase.from('notaries').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send welcome SMS when newly approved
  if (body.active === true && before && !before.active && before.phone) {
    sendSMS(
      before.phone,
      `Hi ${before.name.split(' ')[0]}! You've been approved for the Inksent signing network. When a job is available in your area, you'll get a text with full details and a one-tap accept link. Welcome to the team! — Clayton, Inksent (619) 949-3361`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase.from('notaries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
