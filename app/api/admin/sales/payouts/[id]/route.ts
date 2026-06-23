import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'

// Delete a recorded payout (e.g. entered by mistake).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const supabase = await createClient()
  const { error } = await supabase.from('sales_payouts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logAudit({ action: 'sales_payout_delete', actor: adminEmail(), actorType: 'admin', entityType: 'sales_payout', entityId: id, ip: reqIp(req) })
  return NextResponse.json({ ok: true })
}
