import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = await req.json()

  const supabase = await createClient()
  const { error } = await supabase.from('notaries').update({
    nna_number: d.nna_number || null,
    commission_state_code: d.commission_state_code || null,
    commission_expiry: d.commission_expiry || null,
    bgc_provider: d.bgc_provider || null,
    bgc_date: d.bgc_date || null,
    eo_carrier: d.eo_carrier || null,
    eo_policy: d.eo_policy || null,
    eo_expiry: d.eo_expiry || null,
    has_dual_tray: d.has_dual_tray === 'yes',
    payment_method: d.payment_method || null,
    payment_handle: d.payment_handle || null,
    languages: Array.isArray(d.languages) ? d.languages : [],
    onboarded_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Alert admin that onboarding is complete
  const { data: n } = await supabase.from('notaries').select('name').eq('id', id).single()
  if (process.env.ADMIN_PHONE && n) {
    sendSMS(
      process.env.ADMIN_PHONE,
      `✅ ${n.name} completed onboarding — credentials + payment info on file. (W-9 still to be emailed.)`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
