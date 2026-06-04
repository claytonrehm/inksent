'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import InksentLogo from '@/components/InksentLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createClient()

  async function handleMagicLink() {
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal` },
    })
    setLoading(false)
    if (error) return setError(error.message)
    setMagicSent(true)
  }

  if (magicSent) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">We sent a login link to <strong>{email}</strong>. Click it to access your portal.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full">
        <div className="flex justify-center mb-8">
          <InksentLogo size="md" href="/" />
        </div>

        <h1 className="text-xl font-black text-gray-900 mb-1">Client Portal</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to view your orders and invoices</p>

        <div className="space-y-4">
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@titlecompany.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
          />

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <Button onClick={handleMagicLink} loading={loading} className="w-full" size="lg">
            Send Login Link
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          No password needed — we email you a secure link
        </p>
      </div>
    </main>
  )
}
