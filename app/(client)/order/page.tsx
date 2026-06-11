import OrderForm, { type OrderPrefill } from '@/components/OrderForm'
import InksentLogo from '@/components/InksentLogo'
import BackLink from '@/components/BackLink'
import { createClient, createAuthClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Place a Signing Order — Inksent',
}

export const dynamic = 'force-dynamic'

export default async function OrderPage() {
  // If a partner is signed in, prefill their company/contact from their last order
  // so repeat orders are a few fields, not a full form.
  let prefill: OrderPrefill | undefined
  const auth = await createAuthClient()
  const { data: { user } } = await auth.auth.getUser()
  if (user?.email) {
    const supabase = await createClient()
    const { data: last } = await supabase
      .from('orders')
      .select('client_company, client_name, client_email, client_phone')
      .eq('client_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (last) {
      prefill = {
        client_company: last.client_company ?? undefined,
        client_name: last.client_name ?? undefined,
        client_email: last.client_email ?? user.email,
        client_phone: last.client_phone ?? undefined,
      }
    } else {
      prefill = { client_email: user.email }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <InksentLogo size="md" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <BackLink href="/" label="Back to home" />
          <h1 className="text-3xl font-black text-gray-900 mt-4 mb-2">Place a Signing Order</h1>
          <p className="text-gray-500">
            Available in all 50 states. Submit your order and we&apos;ll confirm a signing agent within 30 minutes.
          </p>
        </div>

        {prefill?.client_company && (
          <div className="mb-4 bg-violet-50 border border-violet-100 text-violet-700 text-sm rounded-xl px-4 py-3">
            Welcome back{prefill.client_name ? `, ${prefill.client_name.split(' ')[0]}` : ''} — we&apos;ve prefilled your company info. Just add the signing details.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <OrderForm prefill={prefill} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions?{' '}
          <a href="tel:+16199493361" className="underline hover:text-gray-600">(619) 949-3361</a>
          {' '}or{' '}
          <a href="mailto:support@inksent.co" className="underline hover:text-gray-600">support@inksent.co</a>
        </p>
      </div>
    </main>
  )
}
