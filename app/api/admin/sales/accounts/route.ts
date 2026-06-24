import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed, adminEmail } from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'
import { normalizeCompany } from '@/lib/sales'

// Attribute a title-company account to a rep. company_key is the normalized
// match key; its UNIQUE constraint guarantees one rep per account.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const salesRepId = String(body.sales_rep_id ?? '').trim()
  const companyName = String(body.company_name ?? '').trim()
  const companyKey = normalizeCompany(companyName)
  if (!salesRepId || !companyKey) return NextResponse.json({ error: 'Rep and company name are required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_accounts')
    .insert({
      sales_rep_id: salesRepId,
      company_name: companyName,
      company_key: companyKey,
      // Default to today so the residual tier window has a stable anchor (don't
      // rely on the first-signing fallback, which can drift).
      landed_at: String(body.landed_at ?? '').trim() || new Date().toISOString().slice(0, 10),
      notes: String(body.notes ?? '').trim() || null,
    })
    .select('id')
    .single()

  if (error) {
    // 23505 = unique violation: this company is already attributed to a rep.
    if (error.code === '23505') return NextResponse.json({ error: 'That company is already assigned to a rep.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  logAudit({ action: 'sales_account_assign', actor: adminEmail(), actorType: 'admin', entityType: 'sales_account', entityId: data?.id, ip: reqIp(req), meta: { salesRepId, companyName } })
  return NextResponse.json({ ok: true, id: data?.id })
}
