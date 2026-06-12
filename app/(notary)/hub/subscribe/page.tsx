import { createClient, createAuthClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InksentLogo from '@/components/InksentLogo'
import SubscribePanel from '@/components/notary/SubscribePanel'
import { hasHubBilling, HUB_PLANS, HUB_TRIAL_DAYS } from '@/lib/hub-billing'
import { isSubscribed } from '@/lib/hub'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Subscribe — Inksent Notary Hub' }

export default async function SubscribePage() {
  const auth = await createAuthClient()
  const {
    data: { user },
  } = await auth.auth.getUser()
  if (!user?.email) redirect('/hub/login')
  const email = user.email
  const supabase = await createClient()

  // Approved roster agents get the Hub free — never show them the paywall.
  const { data: notary } = await supabase.from('notaries').select('id').ilike('email', email).maybeSingle()
  if (notary) redirect('/hub')

  const { data: hubUser } = await supabase
    .from('hub_users')
    .select('name, base_zip, subscription_status')
    .ilike('email', email)
    .maybeSingle()
  if (hubUser && isSubscribed(hubUser.subscription_status)) redirect('/hub')

  const plans = (['monthly', 'annual'] as const).map((k) => ({
    key: k,
    label: HUB_PLANS[k].label,
    amountLabel: HUB_PLANS[k].amountLabel,
    period: HUB_PLANS[k].period,
    note: 'note' in HUB_PLANS[k] ? (HUB_PLANS[k] as { note?: string }).note : undefined,
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <form action="/hub/logout" method="post">
            <button type="submit" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <SubscribePanel
          defaultName={hubUser?.name ?? ''}
          defaultBaseZip={hubUser?.base_zip ?? ''}
          billingEnabled={hasHubBilling()}
          trialDays={HUB_TRIAL_DAYS}
          plans={plans}
        />
      </div>
    </main>
  )
}
