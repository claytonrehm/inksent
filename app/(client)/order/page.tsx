import OrderForm from '@/components/OrderForm'
import InksentLogo from '@/components/InksentLogo'
import BackLink from '@/components/BackLink'

export const metadata = {
  title: 'Place a Signing Order — Inksent',
}

export default function OrderPage() {
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

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <OrderForm />
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
