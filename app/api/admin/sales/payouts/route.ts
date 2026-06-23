import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'

// Record a commission payout made to a rep. This is a ledger entry only — it
// does NOT move money (reps are paid 1099, outside the platform). It lets the
// portal track earned vs paid vs owed.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const salesRepId = String(body.sales_rep_id ?? '').trim()
  const amountCents = Math.round(Number(body.amount_cents))
  if (!salesRepId) return NextResponse.json({ error: 'Rep is required' }, { status: 400 })
  if (!Number.isFinite(amountCents) || amountCents <= 0) return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_payouts')
    .insert({
      sales_rep_id: salesRepId,
      amount_cents: amountCents,
      paid_at: String(body.paid_at ?? '').trim() || null,
      period_label: String(body.period_label ?? '').trim() || null,
      note: String(body.note ?? '').trim() || null,
    })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  logAudit({ action: 'sales_payout_record', actor: adminEmail(), actorType: 'admin', entityType: 'sales_payout', entityId: data?.id, ip: reqIp(req), meta: { salesRepId, amountCents } })
  return NextResponse.json({ ok: true, id: data?.id })
}
