import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, ClipboardList, Users, LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
          <Image src="/inksent-logo.png" alt="Inksent" width={110} height={83} className="object-contain" />
          <p className="text-gray-500 text-xs mt-1 px-1">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem href="/orders" icon={<ClipboardList size={16} />} label="Orders" />
          <NavItem href="/notaries" icon={<Users size={16} />} label="Notaries" badge={pendingCount} />
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
