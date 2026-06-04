import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  zip_codes: z.array(z.string().regex(/^\d{5}$/)).default([]),
  nna_certified: z.boolean().default(false),
  commission_state: z.string().length(2).default('CA'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.from('notaries').insert(parsed.data).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('notaries').select('*').order('name')
  return NextResponse.json(data ?? [])
}
