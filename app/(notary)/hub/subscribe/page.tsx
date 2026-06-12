import { createClient, createAuthClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Notary Hub — Free for Inksent Agents', robots: { index: false, follow: false } }

// The Notary Hub is a free benefit for approved Inksent agents (it auto-populates
// from the jobs we dispatch — there's no value in a manual-entry version for
// outside notaries, so we don't sell it). A logged-in email that isn't on the
// roster lands here and is invited to join the network.
export default async function HubJoinPage() {
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user?.email) redirect('/hub/login')

  const supabase = await createClient()
  const { data: notary } = await supabase.from('notaries').select('id').ilike('email', user.email).maybeSingle()
  if (notary) redirect('/hub')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <form action="/hub/logout" method="post">
            <button type="submit" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">Sign out</button>
          </form>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
          <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-4">Free for Inksent agents</span>
          <h1 className="text-2xl font-black text-gray-900 mb-3">The Notary Hub is a perk for Inksent agents</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your earnings, payouts, mileage, and tax-ready reports — all tracked automatically from the signings we send you. It looks like <strong>{user.email}</strong> isn&apos;t on our agent roster yet. Join the network and the Hub is yours, free.
          </p>
          <Link href="/apply" className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700">
            Apply to become an Inksent agent <ArrowRight size={17} />
          </Link>
          <p className="text-xs text-gray-400 mt-5">Already applied or think this is a mistake? Email <a href="mailto:support@inksent.co" className="underline">support@inksent.co</a>.</p>
        </div>
      </div>
    </main>
  )
}
