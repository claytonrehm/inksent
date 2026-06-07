import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'
import BackLink from '@/components/BackLink'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <InksentLogo size="md" />
          <BackLink href="/" label="Home" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 py-12">
        <article className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 sm:p-10 prose-legal">
          {children}
        </article>
        <div className="text-center mt-6 text-sm text-gray-400">
          <Link href="/faq" className="hover:text-gray-600">FAQ</Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          <span className="mx-2">·</span>
          <a href="mailto:support@inksent.co" className="hover:text-gray-600">support@inksent.co</a>
        </div>
      </div>
    </main>
  )
}
