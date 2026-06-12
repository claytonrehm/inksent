import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { sendSMS } from '@/lib/sms'
import { sendNotaryHubAnnouncementEmail } from '@/lib/email'

// Admin-gated: announce the Notary Hub to EVERY approved (active) agent on the
// bench. Email by default (richer, safer for our pending-A2P number); add ?sms=1
// to also send a short text. Visit while signed in as admin:
//   /api/admin/announce-hub        (email only)
//   /api/admin/announce-hub?sms=1  (email + SMS)
// A review ask is included automatically only if GOOGLE_REVIEW_URL is set.
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const alsoSms = req.nextUrl.searchParams.get('sms') === '1'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const hubUrl = `${baseUrl}/hub/login`

  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('id, name, phone, email')
    .eq('active', true)

  const emailed: string[] = []
  const texted: string[] = []
  for (const n of notaries ?? []) {
    const firstName = (n.name ?? '').split(' ')[0]
    if (n.email) {
      await sendNotaryHubAnnouncementEmail({ name: n.name, email: n.email, hubUrl }).catch(() => {})
      emailed.push((n.name ?? '').trim())
    }
    if (alsoSms && n.phone) {
      await sendSMS(
        n.phone,
        `Hi ${firstName} — your free Inksent Notary Hub is live: earnings, payouts & tax-ready mileage in one place. Sign in (one-tap link, no password): ${hubUrl} — Clayton`
      ).catch(() => {})
      texted.push((n.name ?? '').trim())
    }
  }

  return NextResponse.json({
    ok: true,
    reviewAskIncluded: !!process.env.GOOGLE_REVIEW_URL,
    emailed: emailed.length,
    texted: texted.length,
    emailedNames: emailed,
  })
}
