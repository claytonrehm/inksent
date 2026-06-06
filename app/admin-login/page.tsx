import InksentLogo from '@/components/InksentLogo'
import { isAdminAuthed } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminAuthed()) redirect('/dashboard')
  const { error } = await searchParams

  return (
    <main className="min-h-screen bg-[#07070d] flex items-center justify-center px-4">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl shadow-2xl p-8 max-w-sm w-full backdrop-blur-sm">
        <div className="flex justify-center mb-8">
          <InksentLogo size="md" dark href="/" />
        </div>
        <h1 className="text-xl font-black text-white mb-1">Admin Access</h1>
        <p className="text-slate-400 text-sm mb-6">Enter your admin password to continue.</p>

        <form action="/api/admin/login" method="POST" className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            autoFocus
            required
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-400/50"
          />
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">Incorrect password.</p>
          )}
          <button
            type="submit"
            className="w-full bg-violet-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-violet-500 transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-6">Authorized personnel only.</p>
      </div>
    </main>
  )
}
