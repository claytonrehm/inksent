import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSessionEmail, findHubUser } from '@/lib/hub-server'
import { isSubscribed } from '@/lib/hub'

const schema = z.object({
  signing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fee: z.number().min(0).max(100000), // dollars
  signing_type: z.enum(['purchase', 'refinance', 'heloc', 'reverse_mortgage', 'loan_mod', 'other']).default('other'),
  signer_name: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  property_city: z.string().trim().max(120).optional(),
  property_state: z.string().trim().length(2).optional(),
  property_zip: z.string().regex(/^\d{5}$/),
  status: z.enum(['assigned', 'confirmed', 'completed', 'cancelled']).default('completed'),
  paid: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const email = await getSessionEmail()
  if (!email) return NextResponse.json({ error: 'not signed in' }, { status: 401 })

  const hubUser = await findHubUser(email)
  if (!hubUser || !isSubscribed(hubUser.subscription_status)) {
    return NextResponse.json({ error: 'subscription required' }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'invalid input', detail: parsed.error.issues }, { status: 400 })
  const j = parsed.data

  const db = await createClient()
  const { data, error } = await db
    .from('hub_jobs')
    .insert({
      hub_user_id: hubUser.id,
      signing_date: j.signing_date,
      signing_type: j.signing_type,
      signer_name: j.signer_name || 'Signing',
      company: j.company || null,
      property_city: j.property_city || '',
      property_state: (j.property_state || 'CA').toUpperCase(),
      property_zip: j.property_zip,
      fee: Math.round(j.fee * 100),
      status: j.status,
      completed_at: j.status === 'completed' ? `${j.signing_date}T12:00:00Z` : null,
      paid_at: j.paid ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: 'could not save' }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
