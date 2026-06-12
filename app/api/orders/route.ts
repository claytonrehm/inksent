import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { verifyTurnstile } from '@/lib/turnstile'
import { orderSchema } from '@/lib/validations'
import { sendSMS } from '@/lib/sms'
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from '@/lib/email'
import { blastOrderToCoveringNotaries } from '@/lib/dispatch'
import { clientFeeForType } from '@/lib/pricing'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Honeypot: a hidden field real users never fill. Bots do. Silently accept
    // so the bot thinks it worked, but never create or dispatch anything.
    if (body.company_url) {
      return NextResponse.json({ id: 'ok', confirmation_number: 'RECEIVED' })
    }

    // Abuse throttle: cap orders per IP so a script can't flood the DB + admin SMS
    // + dispatch. Fails open if the limiter is unavailable.
    if (!(await checkRateLimit(`order:${clientIp(req)}`, 8, 3600))) {
      return NextResponse.json({ error: 'Too many orders from this connection. Please wait a bit or call (619) 949-3361.' }, { status: 429 })
    }

    // CAPTCHA (no-op until Turnstile keys are configured)
    const okHuman = await verifyTurnstile(body?.turnstileToken, req.headers.get('x-forwarded-for') ?? undefined)
    if (!okHuman) return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 })

    // Must accept Terms of Service (clickwrap)
    if (body?.terms_accepted !== true) {
      return NextResponse.json({ error: 'Please accept the Terms of Service to place your order.' }, { status: 400 })
    }

    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Keep client_reference out of the main insert so order placement never fails
    // if the migration hasn't been applied yet; save it best-effort below.
    const { client_reference, ...orderData } = parsed.data

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        status: 'pending',
        client_fee: clientFeeForType(orderData.signing_type),  // $200 refi / $250 purchase
        notary_fee: 9000,   // $90.00
      })
      .select('id, confirmation_number, signing_date, signing_time, signing_type, signer_name, property_city, property_zip, property_address, client_name, client_email, client_company, notary_fee, language_needed')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    if (client_reference) {
      await supabase.from('orders').update({ client_reference }).eq('id', data.id)
        .then(({ error }) => { if (error) console.warn('client_reference save skipped:', error.message) })
    }

    const h = parseInt(data.signing_time.split(':')[0])
    const m = data.signing_time.split(':')[1]
    const timeStr = `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
    const dateStr = format(new Date(data.signing_date), 'MMM d')
    const typeStr = data.signing_type.replace(/_/g, ' ')

    // Fully automatic: every valid order dispatches immediately, zero touch.
    // (Bots are filtered by the honeypot before we ever get here.)
    const { blastCount, totalActive } = await blastOrderToCoveringNotaries(supabase, data)
    const blastNote = blastCount > 0
      ? `Auto-blasted to ${blastCount} notar${blastCount === 1 ? 'y' : 'ies'} covering ${data.property_zip} — first to accept wins.`
      : totalActive === 0
        ? 'No active onboarded notaries yet — approve/onboard some.'
        : `⚠️ No onboarded notary covers ZIP ${data.property_zip} — recruit coverage there.`

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
      id: data.id,
      confirmation_number: data.confirmation_number,
      client_reference,
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
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  return NextResponse.json(data)
}
