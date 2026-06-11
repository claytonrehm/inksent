import { createClient, createAuthClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { buildInvoiceHTML } from '@/lib/invoice'
import { hasStripe, createInvoicePaymentLink } from '@/lib/stripe'
import PrintButton from './PrintButton'
import BackLink from '@/components/BackLink'
import { Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('client_email', user.email)
    .single()

  if (!order || !order.invoice_id) notFound()

  // Ensure there's a pay link (unless already paid). Reuse the persisted one; mint
  // and cache a fresh one on first view so we don't create a new Stripe link every load.
  const isPaid = !!order.client_paid_at
  let payUrl: string | null = order.pay_url ?? null
  if (!isPaid && !payUrl && hasStripe()) {
    payUrl = await createInvoicePaymentLink({
      id: order.id,
      confirmation_number: order.confirmation_number,
      client_fee: order.client_fee,
      client_company: order.client_company,
    })
    if (payUrl) {
      await supabase.from('orders').update({ pay_url: payUrl }).eq('id', id)
        .then(({ error }) => { if (error) console.warn('pay_url cache skipped:', error.message) })
    }
  }

  const html = buildInvoiceHTML({ ...order, invoice_number: order.invoice_id, pay_url: isPaid ? null : payUrl })

  // Signed download links for any scan-backs the notary uploaded.
  const scans = (order.scan_backs as { name: string; path: string }[] | null) ?? []
  const scanLinks: { name: string; url: string }[] = []
  for (const s of scans) {
    if (!s?.path) continue
    const { data } = await supabase.storage.from('signing-docs').createSignedUrl(s.path, 3600)
    if (data?.signedUrl) scanLinks.push({ name: s.name || 'Scan-back', url: data.signedUrl })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:p-0">
      <div className="flex justify-between max-w-2xl mx-auto mb-4 px-4 print:hidden">
        <BackLink href="/portal" label="Back to portal" />
        <PrintButton />
      </div>
      {isPaid && (
        <div className="max-w-2xl mx-auto mb-4 px-4 print:hidden">
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-xl px-4 py-3 text-center">
            ✓ This invoice has been paid. Thank you!
          </div>
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />

      {scanLinks.length > 0 && (
        <div className="max-w-2xl mx-auto mt-6 px-4 print:hidden">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Completed signing documents</h2>
            <div className="space-y-2">
              {scanLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-violet-600 hover:underline">
                  <Download size={14} /> {s.name}
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Secure links expire in 1 hour. Refresh this page to regenerate.</p>
          </div>
        </div>
      )}
    </div>
  )
}
