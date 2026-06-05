import Link from 'next/link'
import InksentLogo from '@/components/InksentLogo'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <InksentLogo size="md" />
          <Link href="/" className="text-sm text-violet-600 hover:underline">← Home</Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 py-12">
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 prose-legal">
          {children}
        </article>
        <div className="text-center mt-6 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          <span className="mx-2">·</span>
          <a href="mailto:orders@inksent.co" className="hover:text-gray-600">orders@inksent.co</a>
        </div>
      </div>
    </main>
  )
}
