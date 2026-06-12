import { createClient, createAuthClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InksentLogo from '@/components/InksentLogo'
import NotaryHub from '@/components/notary/NotaryHub'
import ManageBillingButton from '@/components/notary/ManageBillingButton'
import { computeHubMetrics, IRS_MILEAGE_RATE_CENTS, type NotaryOrder } from '@/lib/notary-metrics'
import { hubJobToOrder, isSubscribed, type HubJob, type HubUser } from '@/lib/hub'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Notary Hub — Inksent',
  description: 'Your signings, earnings, payouts, and mileage at a glance.',
}

const ORDER_COLS =
  'id, confirmation_number, status, signing_type, signing_date, signing_time, signer_name, property_address, property_city, property_state, property_zip, notary_fee, notary_paid_at, completed_at, created_at'

function SignOutButton() {
  return (
    <form action="/hub/logout" method="post">
      <button type="submit" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        Sign out
      </button>
    </form>
  )
}

function Shell({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1">
              Notary Hub
            </span>
            {action}
          </div>
        </div>
      </div>
      {children}
    </main>
  )
}

function Greeting({ firstName, welcome }: { firstName: string; welcome?: boolean }) {
  return (
    <div className="mb-6">
      {welcome && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-6">
          <p className="font-semibold text-emerald-800 text-sm">🎉 You&apos;re in — your free trial is active.</p>
          <p className="text-xs text-emerald-700">Add your signings and your dashboard, payment tracking, and mileage reports build themselves.</p>
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Welcome back, {firstName}</h1>
      <p className="text-gray-500 text-sm mt-1">
        Your signings, earnings, payouts, and tax-ready reports — in one place.
      </p>
    </div>
  )
}

export default async function HubPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const auth = await createAuthClient()
  const {
    data: { user },
  } = await auth.auth.getUser()
  if (!user?.email) redirect('/hub/login')
  const email = user.email
  const supabase = await createClient()

  // ── 1) Approved Inksent agent → FREE, data from `orders` ──────────────────
  const { data: notary } = await supabase
    .from('notaries')
    .select('id, name, active, payouts_enabled, base_zip')
    .ilike('email', email)
    .maybeSingle()

  if (notary) {
    if (!notary.active) {
      return (
        <Shell action={<SignOutButton />}>
          <div className="max-w-md mx-auto px-4 py-24 text-center">
            <h1 className="text-xl font-black text-gray-900 mb-2">Account inactive</h1>
            <p className="text-gray-500 text-sm">
              Your agent profile is currently inactive. Contact{' '}
              <a href="mailto:support@inksent.co" className="underline">support@inksent.co</a> to reactivate.
            </p>
          </div>
        </Shell>
      )
    }

    const { data: orders } = await supabase
      .from('orders')
      .select(ORDER_COLS)
      .eq('notary_id', notary.id)
      .order('signing_date', { ascending: false })

    const metrics = computeHubMetrics((orders ?? []) as NotaryOrder[], notary.base_zip, new Date())

    return (
      <Shell action={<SignOutButton />}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Greeting firstName={(notary.name ?? '').split(' ')[0]} />
          <NotaryHub
            notaryId={notary.id}
            payoutsEnabled={!!notary.payouts_enabled}
            showPayoutConnect={!notary.payouts_enabled}
            baseZip={notary.base_zip ?? null}
            mileageRate={IRS_MILEAGE_RATE_CENTS}
            metrics={metrics}
          />
          <p className="text-center text-xs text-gray-400 mt-10">
            Questions about your pay? <a href="tel:+16199493361" className="underline">(619) 949-3361</a> · support@inksent.co
          </p>
        </div>
      </Shell>
    )
  }

  // ── 2) External subscriber → PAID, data from their own `hub_jobs` ─────────
  const { data: hubUserRow } = await supabase.from('hub_users').select('*').ilike('email', email).maybeSingle()
  const hubUser = hubUserRow as HubUser | null

  if (!hubUser || !isSubscribed(hubUser.subscription_status)) {
    redirect('/hub/subscribe')
  }

  const { data: jobs } = await supabase
    .from('hub_jobs')
    .select('*')
    .eq('hub_user_id', hubUser!.id)
    .order('signing_date', { ascending: false })

  const orders = ((jobs ?? []) as HubJob[]).map(hubJobToOrder)
  const metrics = computeHubMetrics(orders, hubUser!.base_zip, new Date())
  const firstName = (hubUser!.name ?? '').split(' ')[0] || 'there'

  return (
    <Shell
      action={
        <>
          <ManageBillingButton />
          <SignOutButton />
        </>
      }
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Greeting firstName={firstName} welcome={welcome === '1'} />
        <NotaryHub
          notaryId={hubUser!.id}
          payoutsEnabled={false}
          showPayoutConnect={false}
          editable
          baseZip={hubUser!.base_zip ?? null}
          mileageRate={IRS_MILEAGE_RATE_CENTS}
          metrics={metrics}
        />
        <p className="text-center text-xs text-gray-400 mt-10">
          Need a hand? <a href="mailto:support@inksent.co" className="underline">support@inksent.co</a>
        </p>
      </div>
    </Shell>
  )
}
