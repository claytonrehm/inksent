import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InksentLogo from '@/components/InksentLogo'
import OnboardForm from './OnboardForm'
import { CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Complete Your Profile — Inksent' }

export default async function OnboardPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ update?: string }>
}) {
  const { id } = await params
  const { update } = await searchParams
  const supabase = await createClient()
  const { data: notary } = await supabase
    .from('notaries')
    .select('id, name, active, onboarded_at, photo_url, nna_number, nna_cert_expiry, commission_state_code, commission_expiry, bgc_provider, bgc_date, eo_carrier, eo_policy, eo_expiry, has_dual_tray, languages')
    .eq('id', id)
    .single()

  if (!notary) notFound()

  // Editable update mode (e.g. from a credential-renewal link) — show the form
  // pre-filled even after onboarding, so notaries can refresh credentials.
  const isUpdate = !!update
  const defaults = {
    nna_number: notary.nna_number ?? '',
    nna_cert_expiry: notary.nna_cert_expiry ?? '',
    commission_state_code: notary.commission_state_code ?? '',
    commission_expiry: notary.commission_expiry ?? '',
    bgc_provider: notary.bgc_provider ?? '',
    bgc_date: notary.bgc_date ?? '',
    eo_carrier: notary.eo_carrier ?? '',
    eo_policy: notary.eo_policy ?? '',
    eo_expiry: notary.eo_expiry ?? '',
    has_dual_tray: notary.has_dual_tray == null ? '' : (notary.has_dual_tray ? 'yes' : 'no'),
    languages: Array.isArray(notary.languages) ? notary.languages : [],
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto"><InksentLogo size="md" /></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {notary.onboarded_at && !isUpdate ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
            <div className="bg-green-50 rounded-full p-5 w-fit mx-auto mb-4">
              <CheckCircle className="text-green-500 w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set, {notary.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 max-w-sm mx-auto mb-5">
              Your profile is complete. You&apos;ll start receiving signing job texts in your area.
            </p>
            <a href={`/onboard/${notary.id}?update=1`} className="text-sm text-violet-600 font-semibold hover:underline">
              Update my info →
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8">
              {isUpdate ? (
                <h1 className="text-3xl font-black text-gray-900 mb-2">Update your info, {notary.name.split(' ')[0]}</h1>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                    <CheckCircle size={13} /> You&apos;re approved!
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome aboard, {notary.name.split(' ')[0]}</h1>
                </>
              )}
              <p className="text-gray-500">
                {isUpdate
                  ? 'Refresh any credentials below and save — only the fields you change are updated.'
                  : 'One last step before your first job — a few details we need to verify your credentials and pay you. Takes about 3 minutes.'}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
              <OnboardForm notaryId={notary.id} notaryName={notary.name} hasPhoto={!!notary.photo_url} isUpdate={isUpdate} defaults={defaults} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Questions? <a href="mailto:support@inksent.co" className="underline hover:text-gray-600">support@inksent.co</a>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
