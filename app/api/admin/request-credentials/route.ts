import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { chaseCredentials } from '@/lib/credential-chase'
import { logAudit, reqIp } from '@/lib/audit'

// Admin-triggered: immediately email + text every active notary missing or expiring
// on any of the four credentials (ignores the cron's 14-day throttle).
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const sent = await chaseCredentials(supabase, { baseUrl, throttleMs: 0, adminPhone: process.env.ADMIN_PHONE })
  logAudit({ action: 'request_credentials_bulk', actor: adminEmail(), actorType: 'admin', entityType: 'notary', ip: reqIp(req), meta: { sent } })
  return NextResponse.json({ ok: true, sent })
}
