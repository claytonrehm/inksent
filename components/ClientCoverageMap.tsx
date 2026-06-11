'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export type CoverageArea = { lat: number; lng: number; radiusMiles: number }

// Client-safe coverage map: just the service-area circles (no notary names, pins,
// or locations). Shows a prospect the footprint we can staff for them.
export default function ClientCoverageMap({ areas }: { areas: CoverageArea[] }) {
  const ref = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    import('leaflet').then((L) => {
      if (cancelled || !ref.current || mapRef.current || areas.length === 0) return
      const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: false }).setView([32.8, -117.0], 9)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map)
      const pts: [number, number][] = []
      for (const a of areas) {
        L.circle([a.lat, a.lng], { radius: a.radiusMiles * 1609.34, color: '#7c3aed', fillColor: '#a855f7', fillOpacity: 0.18, weight: 2 }).addTo(map)
        pts.push([a.lat, a.lng])
      }
      if (pts.length) map.fitBounds(pts as unknown as [number, number][], { padding: [40, 40], maxZoom: 11 })
    })
    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [areas])

  return <div ref={ref} className="w-full h-72 rounded-xl overflow-hidden border border-gray-200 z-0" />
}
