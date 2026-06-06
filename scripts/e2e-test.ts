import { createClient } from '@supabase/supabase-js'
import { blastOrderToCoveringNotaries } from '@/lib/dispatch'

// End-to-end dispatch test: creates a test notary (onboarded, covering La Jolla)
// + a test order, then runs the REAL dispatch. The job-offer email lands in
// clayton.rehm@gmail.com (via +e2e alias) so you see exactly what notaries get.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(url, key, { auth: { persistSession: false } })

const NOTARY_EMAIL = 'clayton.rehm+e2e@gmail.com'

async function main() {
  // Clean any prior test rows
  await supabase.from('orders').delete().like('signer_name', 'E2E TEST%')
  await supabase.from('notaries').delete().eq('email', NOTARY_EMAIL)

  // 1) Test notary: active + onboarded + covers 92037 (La Jolla) within 25mi
  const { data: notary, error: nErr } = await supabase.from('notaries').insert({
    name: 'E2E Test Notary',
    email: NOTARY_EMAIL,
    phone: '+15555550123',
    base_zip: '92037',
    coverage_radius: 25,
    nna_certified: true,
    active: true,
    onboarded_at: new Date().toISOString(),
  }).select().single()
  if (nErr) { console.error('Notary insert failed:', nErr.message); process.exit(1) }
  console.log('✓ Test notary created:', notary.name, notary.id)

  // 2) Test order in La Jolla
  const date = new Date(); date.setDate(date.getDate() + 5)
  const { data: order, error: oErr } = await supabase.from('orders').insert({
    signing_type: 'refinance',
    signing_date: date.toISOString().slice(0, 10),
    signing_time: '10:00:00',
    property_address: '1234 Prospect St',
    property_city: 'La Jolla',
    property_state: 'CA',
    property_zip: '92037',
    signer_name: 'E2E TEST Signer',
    signer_phone: '+15555550100',
    client_company: 'E2E Test Title Co',
    client_name: 'Clayton Rehm',
    client_email: 'clayton.rehm+client@gmail.com',
    client_phone: '+15555550111',
    client_fee: 18500,
    notary_fee: 9000,
  }).select().single()
  if (oErr) { console.error('Order insert failed:', oErr.message); process.exit(1) }
  console.log('✓ Test order created:', order.confirmation_number, order.id)

  // 3) Run the REAL dispatch
  const result = await blastOrderToCoveringNotaries(supabase, order)
  console.log('\n=== DISPATCH RESULT ===')
  console.log(JSON.stringify(result, null, 2))

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  console.log('\n=== ACCEPT URL (click to test the accept flow) ===')
  console.log(`${baseUrl}/accept/${order.id}?notary=${notary.id}`)
  console.log('\nA job-offer email should now be in clayton.rehm@gmail.com (via +e2e).')
  console.log('Order ID:', order.id, '| Notary ID:', notary.id)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
