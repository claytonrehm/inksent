import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { createConnectOnboardingLink, hasStripe, getStripe } from '@/lib/stripe'
import InksentLogo from '@/components/InksentLogo'
import { Landmark, CheckCircle, Clock, ShieldCheck, Lock, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Set Up Payouts — Inksent' }

export default async function ConnectPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ done?: string }>
}) {
  const { id } = await params
  const { done } = await searchParams
  const supabase = await createClient()
  const { data: notary } = await supabase.from('notaries').select('id, name, email, stripe_account_id, payouts_enabled').eq('id', id).single()
  if (!notary) notFound()

  // If returning from Stripe, refresh status
  let payoutsEnabled = notary.payouts_enabled
  if (done && hasStripe() && notary.stripe_account_id) {
    try {
      const acct = await getStripe().accounts.retrieve(notary.stripe_account_id)
      payoutsEnabled = !!acct.payouts_enabled
      await supabase.from('notaries').update({ payouts_enabled: payoutsEnabled }).eq('id', id)
    } catch { /* ignore */ }
  }

  // Generate a fresh onboarding link if not yet enabled. If Connect isn't fully
  // activated yet (e.g. live activation still pending), don't crash — fall back
  // to a friendly "almost there" message so onboarding is never a dead end.
  let onboardUrl: string | null = null
  let setupPending = false
  if (!payoutsEnabled && hasStripe()) {
    try {
      const link = await createConnectOnboardingLink({ id: notary.id, email: notary.email, stripe_account_id: notary.stripe_account_id })
      if (link) {
        onboardUrl = link.url
        if (link.accountId !== notary.stripe_account_id) {
          await supabase.from('notaries').update({ stripe_account_id: link.accountId }).eq('id', id)
        }
      }
    } catch {
      setupPending = true
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-md mx-auto"><InksentLogo size="md" /></div>
      </div>
      <div className="max-w-md mx-auto px-4 py-10">
        {payoutsEnabled ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 text-center">
            <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-1">Payouts are set up!</h1>
            <p className="text-gray-500 text-sm">You&apos;re fully ready. When you complete a signing, your $90 lands in your bank automatically — no invoicing, no waiting on us.</p>
          </div>
        ) : (!hasStripe() || setupPending) ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 text-center">
            <Clock className="text-amber-500 w-10 h-10 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-gray-900 mb-1">Almost there</h1>
            <p className="text-gray-500 text-sm">Your profile&apos;s all set! Payout setup is being finalized on our end — we&apos;ll email you a quick link to connect your bank shortly. You&apos;re good to start receiving job offers.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-7">
            <div className="text-center">
              <div className="bg-violet-50 rounded-full p-4 w-fit mx-auto mb-4">
                <Landmark className="text-violet-600 w-9 h-9" />
              </div>
              <h1 className="text-xl font-black text-gray-900 mb-2">One last step — set up payouts</h1>
              <p className="text-gray-500 text-sm mb-5">
                Connect your bank so your $90 lands automatically after each signing — just like setting up direct deposit. Takes about 2 minutes.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 space-y-3 text-left">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="text-green-600 w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600"><strong className="text-gray-800">Deposits only — we can never pull money out.</strong> This only lets us send your pay <em>to</em> you. We can&apos;t withdraw from or charge your account, ever.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="text-green-600 w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600"><strong className="text-gray-800">No bank login — we never see your info.</strong> You just enter your account &amp; routing number (like a direct-deposit form) into Stripe — used by Amazon, Lyft &amp; millions of businesses. Inksent never sees or stores it.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap className="text-green-600 w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600"><strong className="text-gray-800">Get paid automatically.</strong> No invoicing us, no chasing checks — your pay just lands after each signing.</p>
              </div>
            </div>
            {onboardUrl ? (
              <a href={onboardUrl} className="block w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition-colors text-center">
                Connect Bank Account →
              </a>
            ) : (
              <p className="text-sm text-red-500 text-center">Couldn&apos;t start setup. Please refresh or email orders@inksent.co.</p>
            )}
            <p className="text-xs text-gray-400 mt-4 text-center">🔒 Powered by Stripe — bank-level security. You can also finish this later from your welcome email.</p>
          </div>
        )}
      </div>
    </main>
  )
}
