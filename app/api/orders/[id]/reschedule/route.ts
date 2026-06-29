import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAuthClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/sms'
import { format } from 'date-fns'

// Client-initiated reschedule. Auth: the logged-in title-company user must own the
// order. Updates the date/time and re-notifies the assigned agent + the signer.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

  const { signing_date, signing_time } = await req.json()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(signing_date ?? '') || !/^\d{2}:\d{2}$/.test(signing_time ?? '')) {
    return NextResponse.json({ error: 'Please choose a valid date and time.' }, { status: 400 })
  }
  if (new Date(`${signing_date}T${signing_time}`).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Please choose a future date and time.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('client_email', user.email)
    .single()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (['completed', 'cancelled'].includes(order.status)) {
    return NextResponse.json({ error: 'This signing can’t be rescheduled.' }, { status: 400 })
  }

  // Core update first; stamp rescheduled_at best-effort (pre-migration safe).
  const { error: rescheduleErr } = await supabase.from('orders').update({ signing_date, signing_time }).eq('id', id)
  if (rescheduleErr) return NextResponse.json({ error: 'Could not reschedule — please try again.' }, { status: 500 })
  await supabase.from('orders').update({ rescheduled_at: new Date().toISOString() }).eq('id', id)
    .then(({ error }) => { if (error) console.warn('rescheduled_at stamp skipped:', error.message) })

  const [h, m] = signing_time.split(':').map(Number)
  const timeStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  const dateStr = format(new Date(signing_date), 'EEEE, MMM d')

  // Re-notify the assigned agent of the new time.
  if (order.notary_id) {
    const { data: n } = await supabase.from('notaries').select('name, phone').eq('id', order.notary_id).single()
    if (n?.phone) {
      await sendSMS(n.phone, `⏰ Time change: the ${order.signer_name} signing (${order.confirmation_number}) is now ${dateStr} at ${timeStr}. Please update your calendar. Reply or call (619) 949-3361 if that doesn’t work. — Inksent`).catch(() => {})
    }
  }
  // Let the signer know too, if we have their cell AND the client opted into texts.
  if (order.signer_phone && order.sms_consent_at) {
    await sendSMS(order.signer_phone, `Hi ${order.signer_name.split(' ')[0]}, your signing has been rescheduled to ${dateStr} at ${timeStr}. — Inksent Signing Services`).catch(() => {})
  }
  if (process.env.ADMIN_PHONE) {
    await sendSMS(process.env.ADMIN_PHONE, `📅 ${order.client_company} rescheduled ${order.confirmation_number} (${order.signer_name}) to ${dateStr} ${timeStr}.`).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
