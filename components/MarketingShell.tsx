import Link from 'next/link'
import { Phone, Mail } from 'lucide-react'
import InksentLogo from '@/components/InksentLogo'

// Shared header + footer for public marketing/content pages (resources, landing
// pages). Keeps branding + internal links consistent — internal links from every
// page help the whole site's pages get crawled and rank.
export default function MarketingShell({
  cta = { href: '/order', label: 'Place an Order' },
  children,
}: {
  cta?: { href: string; label: string }
  children: React.ReactNode
}) {
  return (
    <main className="bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <InksentLogo size="md" />
          <div className="flex items-center gap-4 text-sm">
            <a href="tel:+16199493361" className="hidden sm:flex items-center gap-1.5 font-semibold text-gray-700"><Phone size={14} /> (619) 949-3361</a>
            <Link href={cta.href} className="bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700">{cta.label}</Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <InksentLogo size="sm" />
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/partners" className="hover:text-gray-800">For Title Companies</Link>
            <Link href="/join" className="hover:text-gray-800">For Signing Agents</Link>
            <Link href="/resources" className="hover:text-gray-800">Resources</Link>
            <Link href="/faq" className="hover:text-gray-800">FAQ</Link>
            <Link href="/support" className="hover:text-gray-800">Support</Link>
            <a href="mailto:support@inksent.co" className="hover:text-gray-800 flex items-center gap-1"><Mail size={12} /> Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
