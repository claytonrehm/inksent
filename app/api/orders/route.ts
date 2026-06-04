import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { orderSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...parsed.data,
        status: 'pending',
        client_fee: 19500,  // $195.00
        notary_fee: 10000,  // $100.00
      })
      .select('id, confirmation_number')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, confirmation_number: data.confirmation_number })
  } catch (err) {
    console.error('Order creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  return NextResponse.json(data)
}
