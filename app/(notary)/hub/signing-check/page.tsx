import { createClient, createAuthClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import CheckForm from '@/app/tools/signing-check/CheckForm'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'SignCheck — Package QC', robots: { index: false, follow: false } }

export default async function HubSignCheckPage() {
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user?.email) redirect('/hub/login')

  const supabase = await createClient()
  const { data: notary } = await supabase.from('notaries').select('id, active').ilike('email', user.email).maybeSingle()
  const { data: partner } = await supabase.from('signcheck_partners').select('email').ilike('email', user.email).maybeSingle()
  const authorized = !!notary?.active || !!partner

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <Link href="/hub" className="hover:text-gray-900">← Hub</Link>
            <form action="/hub/logout" method="post"><button type="submit" className="hover:text-gray-900">Sign out</button></form>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {authorized ? (
          <>
            <div className="flex items-center gap-2 mb-2"><ShieldCheck size={18} className="text-violet-600" /><h1 className="text-2xl font-black text-gray-900">SignCheck — package QC</h1></div>
            <p className="text-gray-600 mb-6">Upload a loan-signing package and we&apos;ll map every signature, initial, date, and notarization — and flag anything that could get it kicked back. We never store your document.</p>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 sm:p-8">
              <CheckForm />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
            <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-4">Free for Inksent agents</span>
            <h1 className="text-2xl font-black text-gray-900 mb-3">SignCheck is a perk for Inksent agents</h1>
            <p className="text-gray-600 mb-6">It looks like <strong>{user.email}</strong> isn&apos;t on our agent roster yet. Join the network and SignCheck is yours, free.</p>
            <Link href="/apply" className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700">Apply to become an Inksent agent <ArrowRight size={17} /></Link>
            <p className="text-xs text-gray-400 mt-5">Title company? Email <a href="mailto:support@inksent.co" className="underline">support@inksent.co</a> to get your team set up.</p>
          </div>
        )}
      </div>
    </main>
  )
}
