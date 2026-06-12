import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InksentLogo from '@/components/InksentLogo'
import NotaryHub from '@/components/notary/NotaryHub'
import { computeHubMetrics, IRS_MILEAGE_RATE_CENTS, type NotaryOrder } from '@/lib/notary-metrics'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Your Business Hub — Inksent',
  description: 'Your signings, earnings, payouts, and mileage at a glance.',
}

export default async function AgentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: notary } = await supabase
    .from('notaries')
    .select('id, name, payouts_enabled, onboarded_at, base_zip')
    .eq('id', id)
    .single()
  if (!notary) notFound()

  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, confirmation_number, status, signing_type, signing_date, signing_time, signer_name, property_address, property_city, property_state, property_zip, notary_fee, notary_paid_at, completed_at, created_at'
    )
    .eq('notary_id', id)
    .order('signing_date', { ascending: false })

  const metrics = computeHubMetrics((orders ?? []) as NotaryOrder[], notary.base_zip, new Date())
  const firstName = (notary.name ?? '').split(' ')[0]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1">
            Notary Hub · Free for approved agents
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your signings, earnings, payouts, and tax-ready reports — in one place.
          </p>
        </div>

        <NotaryHub
          notaryId={notary.id}
          payoutsEnabled={!!notary.payouts_enabled}
          baseZip={notary.base_zip ?? null}
          mileageRate={IRS_MILEAGE_RATE_CENTS}
          metrics={metrics}
        />

        <p className="text-center text-xs text-gray-400 mt-10">
          Questions about your pay? <a href="tel:+16199493361" className="underline">(619) 949-3361</a> · support@inksent.co
        </p>
      </div>
    </main>
  )
}
