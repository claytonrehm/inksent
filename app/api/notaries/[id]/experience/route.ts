import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Notary-facing: the [id] is the applicant's unguessable UUID (capability token).
// Lets existing applicants supply their real-estate experience after the fact.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  // Accept experience and/or credential dates — at least one must be present.
  if (!body?.re_experience && !body?.nna_cert_expiry && !body?.bgc_date) {
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

  // Credential dates — best-effort so this never fails if a migration lags.
  if (body?.nna_cert_expiry || body?.bgc_date || body?.bgc_provider) {
    await supabase
      .from('notaries')
      .update({
        ...(body.nna_cert_expiry ? { nna_cert_expiry: body.nna_cert_expiry } : {}),
        ...(body.bgc_date ? { bgc_date: body.bgc_date } : {}),
        ...(body.bgc_provider ? { bgc_provider: body.bgc_provider } : {}),
      })
      .eq('id', id)
      .then(({ error }) => { if (error) console.warn('credential dates save skipped:', error.message) })
  }

  return NextResponse.json({ ok: true })
}
