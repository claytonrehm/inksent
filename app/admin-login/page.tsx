import InksentLogo from '@/components/InksentLogo'
import BackLink from '@/components/BackLink'
import { isAdminAuthed } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string; step?: string }> }) {
  if (await isAdminAuthed()) redirect('/dashboard')
  const { error, step } = await searchParams
  const codeStep = step === 'code'

  return (
    <main className="min-h-screen bg-[#07070d] flex items-center justify-center px-4">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl p-8 max-w-sm w-full backdrop-blur-sm">
        <div className="flex justify-center mb-8">
          <InksentLogo size="md" dark href="/" />
        </div>

        {codeStep ? (
          <>
            <h1 className="text-xl font-black text-white mb-1">Enter your code</h1>
            <p className="text-slate-400 text-sm mb-6">We emailed a 6-digit code to your admin inbox. It expires in 10 minutes.</p>
            <form action="/api/admin/verify" method="POST" className="space-y-4">
              <input
                type="text" name="code" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                placeholder="••••••" autoFocus required autoComplete="one-time-code"
                className="w-full bg-white/5 border border-white/10 text-white text-center text-2xl tracking-[0.5em] rounded-lg px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-violet-400/50"
              />
              {error === 'code' && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">That code didn&apos;t match. Use the code from your most recent email, or tap Start over.</p>}
              {error === 'expired' && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">That code expired. Tap Start over to get a fresh one.</p>}
              <button type="submit" className="w-full bg-violet-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-violet-500 transition-colors">Verify &amp; Sign In</button>
            </form>
            <div className="flex justify-center mt-6">
              <BackLink href="/admin-login" label="Start over" dark />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-white mb-1">Admin Access</h1>
            <p className="text-slate-400 text-sm mb-6">Enter your admin password to continue.</p>
            <form action="/api/admin/login" method="POST" className="space-y-4">
              <input
                type="password" name="password" placeholder="Admin password" autoFocus required
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400/50"
              />
              {error === '1' && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">Incorrect password.</p>}
              {error === 'mail' && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">Couldn&apos;t send your code. Try again.</p>}
              {error === 'session' && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">Your sign-in timed out before the code was entered. Please log in again.</p>}
              {error === 'rate' && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">Too many attempts. Wait a few minutes and try again.</p>}
              <button type="submit" className="w-full bg-violet-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-violet-500 transition-colors">Continue</button>
            </form>
            <p className="text-center text-xs text-slate-500 mt-6">Authorized personnel only.</p>
          </>
        )}
      </div>
    </main>
  )
}
