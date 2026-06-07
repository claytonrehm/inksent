import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Notary-facing: the [id] is the applicant's unguessable UUID (capability token).
// Lets existing applicants supply their real-estate experience after the fact.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  if (!body?.re_experience) {
    return NextResponse.json({ error: 'Please select your experience level' }, { status: 400 })
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from('notaries')
    .update({
      re_experience: body.re_experience,
      signing_types: Array.isArray(body.signing_types) ? body.signing_types : [],
    })
    .eq('id', id)
  if (error) return NextResponse.json({ error: 'Could not save — please try again.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
