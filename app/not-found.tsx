import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import { Home, Phone } from 'lucide-react'

export const metadata = { title: 'Page not found — Inksent' }

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8"><InksentLogo size="md" /></div>
      <p className="text-violet-600 font-bold text-sm uppercase tracking-widest mb-3">404</p>
      <h1 className="text-3xl font-black text-gray-900 mb-2">We couldn&apos;t find that page</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        The link may be old or mistyped. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors">
          <Home size={16} /> Back to home
        </Link>
        <a href="tel:+16199493361" className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
          <Phone size={16} /> (619) 949-3361
        </a>
      </div>
    </main>
  )
}
