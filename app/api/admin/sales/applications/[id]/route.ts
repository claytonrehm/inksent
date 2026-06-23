import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'

// Approve (→ creates a sales rep with your default terms) or reject an applicant.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const action = body.action

  const supabase = await createClient()

  if (action === 'reject') {
    const { error } = await supabase.from('sales_rep_applications').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    logAudit({ action: 'sales_applicant_reject', actor: adminEmail(), actorType: 'admin', entityType: 'sales_rep_application', entityId: id, ip: reqIp(req) })
    return NextResponse.json({ ok: true })
  }

  if (action === 'approve') {
    const { data: app, error: getErr } = await supabase.from('sales_rep_applications').select('*').eq('id', id).single()
    if (getErr || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    // Create the rep with default commission terms (DB defaults), linked to the application.
    const { data: rep, error: repErr } = await supabase.from('sales_reps').insert({
      name: app.name,
      email: app.email,
      phone: app.phone,
      application_id: app.id,
    }).select('id').single()
    if (repErr) {
      return NextResponse.json({ error: repErr.message }, { status: 500 })
    }

    await supabase.from('sales_rep_applications').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', id)
    logAudit({ action: 'sales_applicant_approve', actor: adminEmail(), actorType: 'admin', entityType: 'sales_rep_application', entityId: id, ip: reqIp(req), meta: { repId: rep?.id } })
    return NextResponse.json({ ok: true, repId: rep?.id })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// Delete an application record outright.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('sales_rep_applications').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  logAudit({ action: 'sales_applicant_delete', actor: adminEmail(), actorType: 'admin', entityType: 'sales_rep_application', entityId: id, ip: reqIp(req) })
  return NextResponse.json({ ok: true })
}
