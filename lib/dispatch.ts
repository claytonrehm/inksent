import { sendSMS, buildDispatchMessage } from '@/lib/sms'
import { notaryCoversZip } from '@/lib/coverage'
import { format } from 'date-fns'
import type { SupabaseClient } from '@supabase/supabase-js'

interface OrderRow {
  id: string
  signer_name: string
  signing_type: string
  signing_date: string
  signing_time: string
  property_address: string
  property_city: string
  property_zip: string
  notary_fee: number
}

/**
 * Blast an order to every active notary whose coverage radius reaches the
 * property ZIP, optionally excluding some notary IDs (e.g. the one who just
 * cancelled). Returns how many were texted and the list of recipients.
 */
export async function blastOrderToCoveringNotaries(
  supabase: SupabaseClient,
  order: OrderRow,
  opts: { exclude?: string[] } = {}
): Promise<{ blastCount: number; recipients: string[]; totalActive: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://inksent.co'
  const { data: notaries } = await supabase
    .from('notaries')
    .select('id, name, phone, base_zip, coverage_radius')
    .eq('active', true)

  const exclude = new Set(opts.exclude ?? [])
  const covering = (notaries ?? []).filter(
    (n) => !exclude.has(n.id) && notaryCoversZip(n.base_zip, n.coverage_radius, order.property_zip)
  )

  let blastCount = 0
  if (covering.length > 0) {
    const results = await Promise.allSettled(
      covering.map((n) => {
        const acceptUrl = `${baseUrl}/accept/${order.id}?notary=${n.id}`
        return sendSMS(
          n.phone,
          buildDispatchMessage({
            notaryName: n.name.split(' ')[0],
            signerName: order.signer_name,
            signingType: order.signing_type,
            signingDate: format(new Date(order.signing_date), 'EEEE, MMM d'),
            signingTime: order.signing_time,
            propertyAddress: order.property_address,
            propertyCity: order.property_city,
            propertyZip: order.property_zip,
            fee: order.notary_fee,
            acceptUrl,
          })
        )
      })
    )
    blastCount = results.filter((r) => r.status === 'fulfilled').length
    await supabase
      .from('orders')
      .update({ status: 'dispatching', notary_id: null, dispatched_to: covering.map((n) => n.id) })
      .eq('id', order.id)
  }

  return { blastCount, recipients: covering.map((n) => n.id), totalActive: (notaries ?? []).length }
}
