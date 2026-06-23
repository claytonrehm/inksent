import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users, LogOut, Settings, Map, BarChart3, ShieldCheck, Building2, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import InksentLogo from '@/components/InksentLogo'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Gate: every admin page requires a valid admin session.
  if (!(await isAdminAuthed())) redirect('/admin-login')

  const supabase = await createClient()
  const { count } = await supabase
    .from('notaries')
    .select('id', { count: 'exact', head: true })
    .eq('active', false)

  const pendingCount = count ?? 0

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-[#0d0d0d] flex flex-col">
        <div className="px-4 py-5 border-b border-gray-800">
          <InksentLogo size="md" dark />
          <p className="text-gray-500 text-xs mt-2 px-1">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem href="/orders" icon={<ClipboardList size={16} />} label="Orders" />
          <NavItem href="/notaries" icon={<Users size={16} />} label="Notaries" badge={pendingCount} />
          <NavItem href="/coverage" icon={<Map size={16} />} label="Coverage" />
          <NavItem href="/reports" icon={<BarChart3 size={16} />} label="Reports" />
          <NavItem href="/leads" icon={<Building2 size={16} />} label="Partner Leads" />
          <NavItem href="/sales" icon={<TrendingUp size={16} />} label="Sales" />
          <NavItem href="/activity" icon={<ShieldCheck size={16} />} label="Activity" />
          <NavItem href="/setup" icon={<Settings size={16} />} label="Setup" />
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <NavItem href="/" icon={<LogOut size={16} />} label="Back to Site" />
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

function NavItem({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 text-sm transition-colors"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  )
}
