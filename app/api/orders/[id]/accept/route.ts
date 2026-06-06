import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { sendNotaryAssignmentEmail, sendClientAssignmentEmail, sendNotaryDocsEmail } from '@/lib/email'
import { format } from 'date-fns'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id } = await req.json()

  const supabase = await createClient()

  const [orderResult, notaryResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('notaries').select('name, phone, email').eq('id', notary_id).single(),
  ])

  if (orderResult.error || !orderResult.data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orderResult.data
  const notary = notaryResult.data

  if (order.notary_id && order.notary_id !== notary_id) {
    return NextResponse.json({ error: 'Already assigned to another notary' }, { status: 409 })
  }

  await supabase
    .from('orders')
    .update({ notary_id, status: 'assigned' })
    .eq('id', id)

  const h = parseInt(order.signing_time.split(':')[0])
  const m = order.signing_time.split(':')[1]
  const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
  const dateStr = format(new Date(order.signing_date), 'EEEE, MMMM d, yyyy')

  // Notify admin
  if (process.env.ADMIN_PHONE && notary) {
    sendSMS(
      process.env.ADMIN_PHONE,
      `✓ ${notary.name} accepted the ${format(new Date(order.signing_date), 'MMM d')} ${timeStr} signing for ${order.signer_name} in ${order.property_city}. Conf: ${order.confirmation_number}`
    ).catch(console.error)
  }

  if (notary) {
    // Confirmation email + SMS to notary with full details
    sendNotaryAssignmentEmail({
      notaryName: notary.name,
      notaryEmail: notary.email,
      signerName: order.signer_name,
      signerPhone: order.signer_phone,
      signingType: order.signing_type,
      signingDate: dateStr,
      signingTime: timeStr,
      propertyAddress: order.property_address,
      propertyCity: order.property_city,
      propertyState: order.property_state,
      propertyZip: order.property_zip,
      specialInstructions: order.special_instructions,
      confirmationNumber: order.confirmation_number,
      fee: order.notary_fee,
    }).catch(console.error)

    sendSMS(
      notary.phone,
      `✅ You're confirmed for the ${format(new Date(order.signing_date), 'MMM d')} ${timeStr} signing at ${order.property_address}, ${order.property_city}. Signer: ${order.signer_name} · ${order.signer_phone}. Full details sent to your email. Questions? (619) 949-3361`
    ).catch(console.error)

    // Notify client their agent is confirmed
    sendClientAssignmentEmail({
      clientName: order.client_name,
      clientEmail: order.client_email,
      notaryName: notary.name,
      notaryPhone: notary.phone,
      signerName: order.signer_name,
      signingType: order.signing_type,
      signingDate: dateStr,
      signingTime: timeStr,
      propertyAddress: order.property_address,
      propertyCity: order.property_city,
      confirmationNumber: order.confirmation_number,
    }).catch(console.error)

    // If documents are already uploaded, deliver them to whoever just accepted
    // (this is what makes a backup notary instantly get the docs after a cancel)
    const docs = (order.documents as unknown[] | null) ?? []
    if (docs.length > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
      sendNotaryDocsEmail({
        notaryName: notary.name,
        notaryEmail: notary.email,
        signerName: order.signer_name,
        docsUrl: `${baseUrl}/docs/${id}?notary=${notary_id}`,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ ok: true })
}
