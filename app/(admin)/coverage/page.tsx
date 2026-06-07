import { createClient } from '@/lib/supabase/server'
import { lookupZip } from '@/lib/coverage'
import CoverageMapAll, { type CoverageNotary } from '@/components/CoverageMapAll'

export const dynamic = 'force-dynamic'

export default async function CoveragePage() {
  const supabase = await createClient()
  const { data: notaries } = await supabase
    .from('notaries')
    .select('name, base_zip, coverage_radius, active, denied_at')

  const mapped: CoverageNotary[] = []
  for (const n of notaries ?? []) {
    if (n.denied_at || !n.base_zip) continue
    const info = lookupZip(n.base_zip)
    if (!info) continue
    mapped.push({
      name: n.name,
      lat: info.latitude,
      lng: info.longitude,
      radiusMiles: n.coverage_radius ?? 25,
      status: n.active ? 'active' : 'pending',
    })
  }

  const activeCount = mapped.filter(n => n.status === 'active').length
  const pendingCount = mapped.filter(n => n.status === 'pending').length

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Coverage</h1>
        <p className="text-gray-500 text-sm mt-1">Every notary&apos;s home base + travel radius. See where you&apos;re covered and where the gaps are.</p>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ background: 'rgba(124,58,237,0.25)', border: '2px solid #7c3aed' }} />
          <span className="text-gray-700 font-medium">Active bench ({activeCount})</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ background: 'rgba(100,116,139,0.15)', border: '1px dashed #64748b' }} />
          <span className="text-gray-500">Applicants ({pendingCount})</span>
        </span>
      </div>

      <CoverageMapAll notaries={mapped} />

      <p className="text-xs text-gray-400">
        Circles show each agent&apos;s stated travel radius from their home ZIP. Overlapping violet circles = redundant (resilient) coverage; gaps = areas to recruit.
      </p>
    </div>
  )
}
