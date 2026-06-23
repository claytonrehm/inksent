import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'

// Update a sales rep's contact info, status, or commission terms.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const patch: Record<string, unknown> = {}
  if (typeof body.name === 'string') patch.name = body.name.trim()
  if (typeof body.email === 'string') patch.email = body.email.trim()
  if ('phone' in body) patch.phone = String(body.phone ?? '').trim() || null
  if (body.status === 'active' || body.status === 'inactive') patch.status = body.status
  if ('notes' in body) patch.notes = String(body.notes ?? '').trim() || null
  if (Number.isFinite(body.residual_per_signing_cents)) patch.residual_per_signing_cents = Math.round(body.residual_per_signing_cents)
  if (Number.isFinite(body.producer_bonus_cents)) patch.producer_bonus_cents = Math.round(body.producer_bonus_cents)
  if (Number.isFinite(body.bonus_threshold)) patch.bonus_threshold = Math.round(body.bonus_threshold)

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase.from('sales_reps').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logAudit({ action: 'sales_rep_update', actor: adminEmail(), actorType: 'admin', entityType: 'sales_rep', entityId: id, ip: reqIp(req), meta: { fields: Object.keys(patch) } })
  return NextResponse.json({ ok: true })
}

// Remove a sales rep (cascades their accounts + payout records).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const supabase = await createClient()
  const { error } = await supabase.from('sales_reps').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logAudit({ action: 'sales_rep_delete', actor: adminEmail(), actorType: 'admin', entityType: 'sales_rep', entityId: id, ip: reqIp(req) })
  return NextResponse.json({ ok: true })
}
