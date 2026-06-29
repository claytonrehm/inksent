import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { sendSMS } from '@/lib/sms'
import { sendNotaryApprovedEmail } from '@/lib/email'

// Admin-gated: immediately nudge EVERY active notary who hasn't finished onboarding
// (regardless of approved_at/nudge_count) — sends the "you're approved, finish your
// profile" SMS + email. Visit while signed in as admin: /api/admin/nudge-onboarding
// (The daily cron also auto-nudges, but this fires now and backfills approved_at so
// future auto-nudges keep working for agents added without it.)
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('id, name, phone, email, approved_at, sms_consent_at')
    .eq('active', true)
    .is('onboarded_at', null)

  const nudged: string[] = []
  for (const n of notaries ?? []) {
    const onboardUrl = `${baseUrl}/onboard/${n.id}`
    const firstName = (n.name ?? '').split(' ')[0]
    if (n.phone && n.sms_consent_at) {
      await sendSMS(
        n.phone,
        `Hi ${firstName}, you're approved with Inksent! One quick step before we can text you $90 signing jobs — finish your profile (~3 min): ${onboardUrl} — Clayton`
      ).catch(() => {})
    }
    if (n.email) await sendNotaryApprovedEmail({ name: n.name, email: n.email, onboardUrl }).catch(() => {})
    await supabase.from('notaries')
      .update({ nudged_at: new Date().toISOString(), ...(n.approved_at ? {} : { approved_at: new Date().toISOString() }) })
      .eq('id', n.id).then(() => {})
    nudged.push((n.name ?? '').trim())
  }

  return NextResponse.json({ nudged: nudged.length, names: nudged })
}
