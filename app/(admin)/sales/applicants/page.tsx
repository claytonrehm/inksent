import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ApplicantsBoard from './ApplicantsBoard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sales Applicants — Inksent Admin' }

export default async function SalesApplicantsPage() {
  const supabase = await createClient()
  const { data: apps, error } = await supabase
    .from('sales_rep_applications')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600"><ArrowLeft size={15} /> Sales</Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Rep Applicants</h1>
        <p className="text-gray-500 text-sm mt-1">Ranked by fit (title relationships &gt; industry &gt; B2B &gt; tenure). Approve to create a rep with your standard terms.</p>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">Apply the <code>sales_rep_applications</code> migration to see applicants here.</div>
      ) : !apps || apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          No applications yet. Share <span className="font-mono text-violet-600">inksent.co/sales-apply</span> (and link it from your Indeed post).
        </div>
      ) : (
        <ApplicantsBoard apps={apps} />
      )}
    </div>
  )
}
