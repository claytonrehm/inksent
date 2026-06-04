import { createClient } from '@/lib/supabase/server'
import AddNotaryForm from './AddNotaryForm'

export const dynamic = 'force-dynamic'

export default async function NotariesPage() {
  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('*')
    .order('name')

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notary Network</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your signing agents and coverage areas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">ZIP Codes</th>
                  <th className="px-4 py-3 text-left">NNA</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!notaries || notaries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      No notaries yet — add your first one
                    </td>
                  </tr>
                ) : (
                  notaries.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div>{n.name}</div>
                        <div className="text-xs text-gray-400">{n.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{n.phone}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(n.zip_codes ?? []).map((z: string) => (
                            <span key={z} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                              {z}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {n.nna_certified ? (
                          <span className="text-green-600 text-xs font-medium">Certified</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${n.active ? 'text-green-600' : 'text-red-500'}`}>
                          {n.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Notary Form */}
        <div>
          <AddNotaryForm />
        </div>
      </div>
    </div>
  )
}
