import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'
import { normalizeCompany } from '@/lib/sales'

// Update an account: change status (active/dormant), notes, rename the company
// (recomputes the match key), or reassign it to a different rep.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const patch: Record<string, unknown> = {}
  if (body.status === 'active' || body.status === 'dormant') patch.status = body.status
  if ('notes' in body) patch.notes = String(body.notes ?? '').trim() || null
  if ('landed_at' in body) patch.landed_at = String(body.landed_at ?? '').trim() || null
  if (typeof body.sales_rep_id === 'string' && body.sales_rep_id.trim()) patch.sales_rep_id = body.sales_rep_id.trim()
  if (typeof body.company_name === 'string' && body.company_name.trim()) {
    patch.company_name = body.company_name.trim()
    patch.company_key = normalizeCompany(body.company_name)
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase.from('sales_accounts').update(patch).eq('id', id)
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That company is already assigned to a rep.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  logAudit({ action: 'sales_account_update', actor: adminEmail(), actorType: 'admin', entityType: 'sales_account', entityId: id, ip: reqIp(req), meta: { fields: Object.keys(patch) } })
  return NextResponse.json({ ok: true })
}

// Unassign an account from its rep.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const supabase = await createClient()
  const { error } = await supabase.from('sales_accounts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logAudit({ action: 'sales_account_remove', actor: adminEmail(), actorType: 'admin', entityType: 'sales_account', entityId: id, ip: reqIp(req) })
  return NextResponse.json({ ok: true })
}
