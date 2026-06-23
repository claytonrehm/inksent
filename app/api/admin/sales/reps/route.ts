import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'

// Create a sales rep. Commission terms default at the DB level ($15/signing,
// $200 bonus at 25) but can be overridden per rep here.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })

  const insert: Record<string, unknown> = {
    name,
    email,
    phone: String(body.phone ?? '').trim() || null,
    notes: String(body.notes ?? '').trim() || null,
  }
  if (Number.isFinite(body.residual_per_signing_cents)) insert.residual_per_signing_cents = Math.round(body.residual_per_signing_cents)
  if (Number.isFinite(body.producer_bonus_cents)) insert.producer_bonus_cents = Math.round(body.producer_bonus_cents)
  if (Number.isFinite(body.bonus_threshold)) insert.bonus_threshold = Math.round(body.bonus_threshold)

  const supabase = await createClient()
  const { data, error } = await supabase.from('sales_reps').insert(insert).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logAudit({ action: 'sales_rep_create', actor: adminEmail(), actorType: 'admin', entityType: 'sales_rep', entityId: data?.id, ip: reqIp(req), meta: { name, email } })
  return NextResponse.json({ ok: true, id: data?.id })
}
