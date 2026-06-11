import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'

// Notary-facing: the [id] in the URL is the notary's unguessable UUID, which
// acts as the capability token (same pattern as accept/decline). NOT admin-gated.
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
    languages: Array.isArray(d.languages) ? d.languages : [],
    ...(d.photo_url ? { photo_url: d.photo_url } : {}),
    onboarded_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // NNA renewal date + E&O coverage amount — best-effort so onboarding never fails
  // on a pre-migration DB.
  if (d.nna_cert_expiry) {
    await supabase.from('notaries').update({ nna_cert_expiry: d.nna_cert_expiry }).eq('id', id)
      .then(({ error }) => { if (error) console.warn('nna_cert_expiry save skipped:', error.message) })
  }
  const eoAmt = parseInt(d.eo_coverage_amount, 10)
  if (Number.isFinite(eoAmt)) {
    await supabase.from('notaries').update({ eo_coverage_amount: eoAmt }).eq('id', id)
      .then(({ error }) => { if (error) console.warn('eo_coverage_amount save skipped:', error.message) })
  }

  // Alert admin that onboarding is complete
  const { data: n } = await supabase.from('notaries').select('name').eq('id', id).single()
  if (process.env.ADMIN_PHONE && n) {
    const eoNote = d.eo_carrier ? `E&O: ${d.eo_carrier}` : '⚠️ no E&O yet — confirm before first job'
    sendSMS(
      process.env.ADMIN_PHONE,
      `✅ ${n.name} completed their profile (${eoNote}). Next they connect direct deposit (Stripe).`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
