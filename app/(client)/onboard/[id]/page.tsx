import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InksentLogo from '@/components/InksentLogo'
import OnboardForm from './OnboardForm'
import { CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Complete Your Profile — Inksent' }

export default async function OnboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: notary } = await supabase
    .from('notaries')
    .select('id, name, active, onboarded_at')
    .eq('id', id)
    .single()

  if (!notary) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto"><InksentLogo size="md" /></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {notary.onboarded_at ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
            <div className="bg-green-50 rounded-full p-5 w-fit mx-auto mb-4">
              <CheckCircle className="text-green-500 w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set, {notary.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 max-w-sm mx-auto">
              Your profile is complete. You&apos;ll start receiving signing job texts in your area. You can update this info anytime by revisiting this link.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <CheckCircle size={13} /> You&apos;re approved!
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome aboard, {notary.name.split(' ')[0]}</h1>
              <p className="text-gray-500">
                One last step before your first job — a few details we need to verify your credentials and pay you. Takes about 3 minutes.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
              <OnboardForm notaryId={notary.id} notaryName={notary.name} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Questions? <a href="mailto:orders@inksent.co" className="underline hover:text-gray-600">orders@inksent.co</a>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
