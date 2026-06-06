import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { blastOrderToCoveringNotaries } from '@/lib/dispatch'

// TEMPORARY token-locked end-to-end test. Delete after verifying dispatch.
const NOTARY_EMAIL = 'clayton.rehm+e2e@gmail.com'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!process.env.E2E_TEST_KEY || key !== process.env.E2E_TEST_KEY) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const supabase = await createClient()

  // Cleanup mode
  if (req.nextUrl.searchParams.get('cleanup') === '1') {
    await supabase.from('orders').delete().like('signer_name', 'E2E TEST%')
    await supabase.from('notaries').delete().eq('email', NOTARY_EMAIL)
    return NextResponse.json({ cleaned: true })
  }

  // Fresh start
  await supabase.from('orders').delete().like('signer_name', 'E2E TEST%')
  await supabase.from('notaries').delete().eq('email', NOTARY_EMAIL)

  const { data: notary, error: nErr } = await supabase.from('notaries').insert({
    name: 'E2E Test Notary', email: NOTARY_EMAIL, phone: '+15555550123',
    base_zip: '92037', coverage_radius: 25, nna_certified: true, active: true,
    onboarded_at: new Date().toISOString(),
  }).select().single()
  if (nErr) return NextResponse.json({ step: 'notary', error: nErr.message }, { status: 500 })

  const date = new Date(); date.setDate(date.getDate() + 5)
  const { data: order, error: oErr } = await supabase.from('orders').insert({
    signing_type: 'refinance', signing_date: date.toISOString().slice(0, 10), signing_time: '10:00:00',
    property_address: '1234 Prospect St', property_city: 'La Jolla', property_state: 'CA', property_zip: '92037',
    signer_name: 'E2E TEST Signer', signer_phone: '+15555550100',
    client_company: 'E2E Test Title Co', client_name: 'Clayton Rehm',
    client_email: 'clayton.rehm+client@gmail.com', client_phone: '+15555550111',
    client_fee: 18500, notary_fee: 9000,
  }).select().single()
  if (oErr) return NextResponse.json({ step: 'order', error: oErr.message }, { status: 500 })

  const result = await blastOrderToCoveringNotaries(supabase, order)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://inksent.co'

  return NextResponse.json({
    ok: true,
    dispatch: result,
    acceptUrl: `${baseUrl}/accept/${order.id}?notary=${notary.id}`,
    orderId: order.id,
    notaryId: notary.id,
    confirmation: order.confirmation_number,
    note: 'Job-offer email sent to clayton.rehm+e2e@gmail.com',
  })
}
