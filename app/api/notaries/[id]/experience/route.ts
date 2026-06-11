import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Notary-facing: the [id] is the applicant's unguessable UUID (capability token).
// Lets existing applicants supply their real-estate experience after the fact.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  // Accept experience and/or credential data — at least one must be present.
  if (!body?.re_experience && !body?.nna_cert_expiry && !body?.bgc_date && !body?.eo_carrier && !body?.commission_expiry) {
    return NextResponse.json({ error: 'Nothing to save.' }, { status: 400 })
  }

  const supabase = await createClient()

  if (body?.re_experience) {
    const { error } = await supabase
      .from('notaries')
      .update({ re_experience: body.re_experience, signing_types: Array.isArray(body.signing_types) ? body.signing_types : [] })
      .eq('id', id)
    if (error) return NextResponse.json({ error: 'Could not save — please try again.' }, { status: 500 })
  }

  // Credentials — best-effort so this never fails if a migration lags.
  const amt = parseInt(body?.eo_coverage_amount, 10)
  const creds = {
    ...(body.nna_cert_expiry ? { nna_cert_expiry: body.nna_cert_expiry } : {}),
    ...(body.bgc_date ? { bgc_date: body.bgc_date } : {}),
    ...(body.bgc_provider ? { bgc_provider: body.bgc_provider } : {}),
    ...(body.eo_carrier ? { eo_carrier: body.eo_carrier } : {}),
    ...(body.eo_expiry ? { eo_expiry: body.eo_expiry } : {}),
    ...(Number.isFinite(amt) ? { eo_coverage_amount: amt } : {}),
    ...(body.commission_expiry ? { commission_expiry: body.commission_expiry } : {}),
  }
  if (Object.keys(creds).length > 0) {
    await supabase.from('notaries').update(creds).eq('id', id)
      .then(({ error }) => { if (error) console.warn('credential save skipped:', error.message) })
  }

  return NextResponse.json({ ok: true })
}
