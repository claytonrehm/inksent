import { Phone, Mail } from 'lucide-react'
import MarketingShell from '@/components/MarketingShell'
import SupportForm from './SupportForm'

export const metadata = {
  title: 'Support — Report an Issue | Inksent',
  description: 'Report a problem or get help with Inksent. Title companies and signing agents can reach our team here, by email, or by phone.',
  alternates: { canonical: '/support' },
}

export default function SupportPage() {
  return (
    <MarketingShell cta={{ href: '/order', label: 'Place an Order' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-3">Support & issue reporting</h1>
        <p className="text-lg text-gray-600 mb-8">
          Something not working, or need a hand? Tell us below and it comes straight to our team — we&apos;ll follow up fast. You can also reach us directly:
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <a href="tel:+16199493361" className="inline-flex items-center gap-2 border border-gray-200 rounded-xl px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"><Phone size={16} className="text-violet-600" /> (619) 949-3361</a>
          <a href="mailto:support@inksent.co" className="inline-flex items-center gap-2 border border-gray-200 rounded-xl px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50"><Mail size={16} className="text-violet-600" /> support@inksent.co</a>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
          <SupportForm />
        </div>
      </div>
    </MarketingShell>
  )
}
