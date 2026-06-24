import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { sendNotaryAssignmentEmail, sendClientAssignmentEmail, sendNotaryDocsEmail } from '@/lib/email'
import { credentialsEligible } from '@/lib/credentials'
import { format } from 'date-fns'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { notary_id } = await req.json()

  const supabase = await createClient()

  const [orderResult, notaryResult] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase.from('notaries').select('name, phone, email, active, onboarded_at, photo_url, nna_certified, nna_cert_expiry, background_checked, bgc_date, eo_carrier, eo_expiry, commission_expiry').eq('id', notary_id).single(),
  ])

  if (orderResult.error || !orderResult.data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const order = orderResult.data
  const notary = notaryResult.data

  // Idempotent: this notary already holds it
  if (order.notary_id === notary_id) {
    return NextResponse.json({ ok: true, already: true })
  }
  // Taken by someone else
  if (order.notary_id && order.notary_id !== notary_id) {
    return NextResponse.json({ error: 'This signing has already been taken by another agent.' }, { status: 409 })
  }
  // Only open orders can be accepted (not completed/cancelled)
  if (!['pending', 'dispatching'].includes(order.status)) {
    return NextResponse.json({ error: 'This signing is no longer available.' }, { status: 409 })
  }
  // The notary must be a real, active, onboarded agent
  if (!notary || notaryResult.error || !notary.active || !notary.onboarded_at) {
    return NextResponse.json({ error: 'Your account isn’t active yet — please finish onboarding first.' }, { status: 403 })
  }
  // Re-check credentials at claim time — a credential can lapse between the blast
  // and the tap. Keeps the "every agent vetted & insured" promise true at the
  // moment of assignment, not just at dispatch.
  if (!credentialsEligible(notary)) {
    return NextResponse.json({ error: 'Your credentials need updating before you can accept jobs — please update them from your dashboard.' }, { status: 403 })
  }
  // The notary must have actually been offered this job, and not have declined it
  const dispatchedTo: string[] = order.dispatched_to ?? []
  const declinedBy: string[] = order.declined_by ?? []
  if (dispatchedTo.length > 0 && !dispatchedTo.includes(notary_id)) {
    return NextResponse.json({ error: 'This signing wasn’t offered to your account.' }, { status: 403 })
  }
  if (declinedBy.includes(notary_id)) {
    return NextResponse.json({ error: 'You previously declined this signing.' }, { status: 409 })
  }

  // Prevent double-booking: reject if this notary already holds another signing within 3h
  const thisWhen = new Date(`${order.signing_date}T${order.signing_time}`).getTime()
  const { data: others } = await supabase
    .from('orders')
    .select('signing_date, signing_time')
    .eq('notary_id', notary_id)
    .in('status', ['assigned', 'confirmed'])
    .neq('id', id)
  const conflict = (others ?? []).some((x) => {
    const w = new Date(`${x.signing_date}T${x.signing_time}`).getTime()
    return Math.abs(w - thisWhen) < 3 * 3600 * 1000
  })
  if (conflict) {
    return NextResponse.json({ error: 'You already have a signing booked within 3 hours of this one — it would overlap.' }, { status: 409 })
  }

  // Atomic claim: only succeeds if the order is STILL unassigned. If two notaries
  // tap "accept" at the same instant, exactly one wins the row — no double-booking.
  const { data: claimed } = await supabase
    .from('orders')
    .update({ notary_id, status: 'assigned', accepted_at: new Date().toISOString() })
    .eq('id', id)
    .is('notary_id', null)
    .select('id')
  if (!claimed || claimed.length === 0) {
    return NextResponse.json({ error: 'This signing was just taken by another agent.' }, { status: 409 })
  }

  const h = parseInt(order.signing_time.split(':')[0])
  const m = order.signing_time.split(':')[1]
  const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
  const dateStr = format(new Date(order.signing_date), 'EEEE, MMMM d, yyyy')

  // Borrower heads-up: text the signer who's coming + when (once)
  if (notary && order.signer_phone && !order.borrower_notified_at) {
    sendSMS(
      order.signer_phone,
      `Hi ${order.signer_name.split(' ')[0]}, this is Inksent Signing Services. Your notary ${notary.name} is confirmed for your signing on ${format(new Date(order.signing_date), 'EEEE, MMM d')} at ${timeStr}. They'll bring everything needed. Questions? (619) 949-3361`
    ).catch(console.error)
    await supabase.from('orders').update({ borrower_notified_at: new Date().toISOString() }).eq('id', id)
  }

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
      completeUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'}/complete/${id}?notary=${notary_id}`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'}/agent/${notary_id}`,
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
      notaryPhotoUrl: notary.photo_url,
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
