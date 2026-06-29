import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InksentLogo from '@/components/InksentLogo'
import AvailabilityForm from './AvailabilityForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Your Availability — Inksent' }

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: notary } = await supabase
    .from('notaries')
    .select('id, name, availability')
    .eq('id', id)
    .single()

  if (!notary) notFound()

  const current = Array.isArray(notary.availability) ? (notary.availability as string[]) : []
  const firstName = (notary.name ?? '').split(' ')[0] || 'there'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-xl mx-auto"><InksentLogo size="md" /></div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">When are you free, {firstName}?</h1>
          <p className="text-gray-500">
            Tap every window that generally works for you. This is how we decide who to text when a
            title company needs a signing covered — the more you mark, the more $90 jobs we can send
            your way. You can change this anytime.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <AvailabilityForm notaryId={notary.id} firstName={firstName} current={current} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Questions? <a href="mailto:support@inksent.co" className="underline hover:text-gray-600">support@inksent.co</a>
        </p>
      </div>
    </main>
  )
}
