import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { orderSchema } from '@/lib/validations'
import { sendSMS } from '@/lib/sms'
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from '@/lib/email'
import { blastOrderToCoveringNotaries } from '@/lib/dispatch'
import { format } from 'date-fns'

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
        client_fee: 17500,  // $175.00
        notary_fee: 9000,   // $90.00
      })
      .select('id, confirmation_number, signing_date, signing_time, signing_type, signer_name, property_city, property_zip, property_address, client_name, client_email, client_company, notary_fee')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const h = parseInt(data.signing_time.split(':')[0])
    const m = data.signing_time.split(':')[1]
    const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
    const dateStr = format(new Date(data.signing_date), 'MMM d')
    const typeStr = data.signing_type.replace(/_/g, ' ')

    // Auto-blast active notaries whose coverage radius reaches this property
    const { blastCount, totalActive } = await blastOrderToCoveringNotaries(supabase, data)

    // Notify admin — SMS (needs A2P) + email (always works)
    const blastNote = blastCount > 0
      ? `Auto-blasted to ${blastCount} notar${blastCount === 1 ? 'y' : 'ies'} covering ${data.property_zip} — first to accept wins.`
      : totalActive === 0
        ? 'No active notaries yet — approve some, then dispatch manually.'
        : `⚠️ No notary in your network covers ZIP ${data.property_zip}. Dispatch manually or recruit coverage there.`

    if (process.env.ADMIN_PHONE) {
      sendSMS(
        process.env.ADMIN_PHONE,
        `📋 New order: ${typeStr} for ${data.signer_name} in ${data.property_city} on ${dateStr} at ${timeStr}. Conf: ${data.confirmation_number}. ${blastNote}`
      ).catch(console.error)
    }

    sendAdminOrderAlert({
      confirmationNumber: data.confirmation_number,
      signingType: data.signing_type,
      signingDate: format(new Date(data.signing_date), 'EEEE, MMM d'),
      signingTime: timeStr,
      signerName: data.signer_name,
      propertyAddress: data.property_address,
      propertyCity: data.property_city,
      propertyState: parsed.data.property_state,
      propertyZip: data.property_zip,
      clientCompany: data.client_company,
      clientName: data.client_name,
      clientPhone: parsed.data.client_phone,
      clientEmail: data.client_email,
      blastInfo: blastNote,
    }).catch(console.error)

    // Confirm to client
    sendOrderConfirmationEmail({
      confirmation_number: data.confirmation_number,
      client_name: data.client_name,
      client_email: data.client_email,
      signing_type: data.signing_type,
      signing_date: data.signing_date,
      signing_time: data.signing_time,
      signer_name: data.signer_name,
      property_city: data.property_city,
    }).catch(console.error)

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

  if (error) return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  return NextResponse.json(data)
}
