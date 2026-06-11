import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InksentLogo from '@/components/InksentLogo'
import FinishForm from './FinishForm'

export const dynamic = 'force-dynamic'

export default async function FinishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: n } = await supabase.from('notaries').select('id, name, re_experience, nna_cert_expiry, bgc_date').eq('id', id).single()
  if (!n) notFound()

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-12">
      <div className="mb-8"><InksentLogo size="md" href="/" /></div>
      <FinishForm
        notaryId={n.id}
        notaryName={n.name}
        hasExperience={!!n.re_experience}
        defaults={{ nna_cert_expiry: n.nna_cert_expiry, bgc_date: n.bgc_date }}
      />
    </main>
  )
}
