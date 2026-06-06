import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { sendSMS } from '@/lib/sms'
import { sendNotaryApprovedEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const supabase = await createClient()

  // Get current notary state to detect approval
  const { data: before } = await supabase.from('notaries').select('active, name, phone, email').eq('id', id).single()

  const { error } = await supabase.from('notaries').update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // On newly approved: send welcome SMS + approval email, both with the onboarding link
  if (body.active === true && before && !before.active) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
    const onboardUrl = `${baseUrl}/onboard/${id}`
    const firstName = before.name.split(' ')[0]

    if (before.phone) {
      sendSMS(
        before.phone,
        `Hi ${firstName}! You're approved for the Inksent signing network 🎉 One quick step before your first job — complete your profile here: ${onboardUrl} — Clayton, Inksent`
      ).catch(console.error)
    }
    if (before.email) {
      sendNotaryApprovedEmail({ name: before.name, email: before.email, onboardUrl }).catch(console.error)
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase.from('notaries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
