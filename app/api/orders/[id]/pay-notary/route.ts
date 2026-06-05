import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { format } from 'date-fns'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, notaries(name, phone)')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('orders')
    .update({ notary_paid_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify notary they've been paid
  if (order?.notaries?.phone && order?.notary_fee) {
    const firstName = (order.notaries.name as string).split(' ')[0]
    sendSMS(
      order.notaries.phone,
      `Hi ${firstName}, your payment of $${(order.notary_fee / 100).toFixed(0)} for the ${format(new Date(order.signing_date), 'MMM d')} signing has been sent. Thanks for a great job! — Clayton, Inksent`
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
