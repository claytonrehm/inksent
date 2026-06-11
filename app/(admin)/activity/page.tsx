import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Activity Log — Inksent Admin', description: 'Security & action audit trail.' }

const LABELS: Record<string, string> = {
  admin_login_success: 'Admin login',
  admin_login_failed: 'Failed login',
  admin_login_password_ok: 'Password OK (2FA sent)',
  refund: 'Refund issued',
  pay_notary: 'Notary paid',
  approve_notary: 'Notary approved',
  deactivate_notary: 'Notary deactivated',
  deny_notary: 'Application denied',
  edit_notary: 'Notary edited',
  document_access: 'Document accessed',
}

function actionStyle(action: string, success: boolean) {
  if (!success || action === 'admin_login_failed') return 'bg-red-100 text-red-700'
  if (action === 'refund' || action === 'deactivate_notary' || action === 'deny_notary') return 'bg-amber-100 text-amber-800'
  if (action === 'pay_notary' || action === 'approve_notary') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-600'
}

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: events, error } = await supabase
    .from('audit_log')
    .select('id, created_at, actor, actor_type, action, entity_type, entity_id, ip, success, meta')
    .order('created_at', { ascending: false })
    .limit(300)

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck size={20} className="text-violet-600" /> Activity &amp; Security Log</h1>
        <p className="text-gray-500 text-sm mt-1">Append-only record of admin actions, logins, payments, and document access.</p>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          The audit log isn&apos;t available yet — apply the <code className="font-mono">audit_log</code> migration to start recording events.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!events || events.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No activity recorded yet.</td></tr>
              ) : events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{format(new Date(e.created_at), 'MMM d, h:mm a')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${actionStyle(e.action, e.success !== false)}`}>
                      {LABELS[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{e.actor ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.entity_type ? `${e.entity_type}${e.entity_id ? ` · ${String(e.entity_id).slice(0, 8)}` : ''}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{e.ip ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[220px] truncate">{e.meta ? JSON.stringify(e.meta) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400">Showing the most recent 300 events.</p>
    </div>
  )
}
