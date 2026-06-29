import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { sendSMS } from '@/lib/sms'
import { sendAvailabilityRequestEmail } from '@/lib/email'

// Admin-gated: prompt every active notary who hasn't set their availability yet
// (empty `availability` array) to set it via a no-login one-tap link. This matches
// the "haven't set availability yet" count on the /coverage page exactly:
// active === true, denied_at is null, availability is empty.
// Visit while signed in as admin: /api/admin/nudge-availability
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('id, name, phone, email, availability, active, denied_at')
    .eq('active', true)
    .is('denied_at', null)

  const missing = (notaries ?? []).filter(
    n => !(Array.isArray(n.availability) && n.availability.length > 0)
  )

  const nudged: string[] = []
  for (const n of missing) {
    const url = `${baseUrl}/availability/${n.id}`
    const firstName = (n.name ?? '').split(' ')[0]
    if (n.phone) {
      await sendSMS(
        n.phone,
        `Hi ${firstName}, it's Clayton at Inksent. We don't have your availability on file yet, so you may be getting skipped for $90 signings you'd take. Tap the windows that fit you (30 sec, no login): ${url}`
      ).catch(() => {})
    }
    if (n.email) await sendAvailabilityRequestEmail({ name: n.name, email: n.email, availabilityUrl: url }).catch(() => {})
    await supabase.from('notaries')
      .update({ availability_nudged_at: new Date().toISOString() })
      .eq('id', n.id).then(() => {})
    nudged.push((n.name ?? '').trim())
  }

  return NextResponse.json({ nudged: nudged.length, names: nudged })
}
