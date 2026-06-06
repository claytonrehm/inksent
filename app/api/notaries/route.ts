import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { lookupZip } from '@/lib/coverage'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  base_zip: z.string().regex(/^\d{5}$/),
  coverage_radius: z.number().int().positive().default(25),
  nna_certified: z.boolean().default(false),
  active: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Check the required fields' }, { status: 400 })

  const d = parsed.data
  const base = lookupZip(d.base_zip)
  if (!base) return NextResponse.json({ error: 'ZIP code not recognized' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.from('notaries').insert({
    name: d.name,
    email: d.email,
    phone: d.phone,
    base_zip: d.base_zip,
    coverage_radius: d.coverage_radius,
    zip_codes: [d.base_zip],
    nna_certified: d.nna_certified,
    active: d.active,
  }).select('id').single()
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A notary with this email already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createClient()
  const { data } = await supabase.from('notaries').select('*').order('name')
  return NextResponse.json(data ?? [])
}
