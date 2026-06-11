import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { sendSMS } from '@/lib/sms'
import { sendNotaryDeniedEmail } from '@/lib/email'
import { logAudit, reqIp } from '@/lib/audit'

// Deny a notary application: mark denied (retained, not deleted) + notify them
// kindly that we're going with other applicants but keeping them on file.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const supabase = await createClient()

  const { data: n } = await supabase.from('notaries').select('name, email, phone, denied_at').eq('id', id).single()
  if (!n) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase
    .from('notaries')
    .update({ active: false, denied_at: new Date().toISOString(), denial_reason: body?.reason ?? null })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logAudit({ action: 'deny_notary', actor: adminEmail(), actorType: 'admin', entityType: 'notary', entityId: id, ip: reqIp(req), meta: { name: n.name, reason: body?.reason ?? null } })

  // Notify once (don't re-notify if already denied before)
  if (!n.denied_at) {
    const firstName = (n.name ?? '').split(' ')[0]
    if (n.email) sendNotaryDeniedEmail({ name: n.name, email: n.email }).catch(console.error)
    if (n.phone) {
      sendSMS(
        n.phone,
        `Hi ${firstName}, thank you for applying to Inksent. We're moving forward with other applicants for now, but we're growing and will keep your application on file for when more spots open in your area. — Inksent`
      ).catch(console.error)
    }
  }

  return NextResponse.json({ ok: true })
}
