'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Phone } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaced in server logs for debugging; no sensitive detail shown to the user.
    console.error('App error boundary:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-amber-50 rounded-full p-4 mb-5">
        <AlertTriangle className="text-amber-500 w-10 h-10" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        We hit an unexpected error. Try again — if it keeps happening, call or text us and we&apos;ll sort it out fast.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => reset()} className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors">
          <RotateCcw size={16} /> Try again
        </button>
        <Link href="/" className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
          Back to home
        </Link>
        <a href="tel:+16199493361" className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
          <Phone size={16} /> (619) 949-3361
        </a>
      </div>
    </main>
  )
}
