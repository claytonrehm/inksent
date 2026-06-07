'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export type CoverageNotary = {
  name: string
  lat: number
  lng: number
  radiusMiles: number
  status: 'active' | 'pending'
}

// Network-wide coverage map: every notary's home + travel-radius circle on one
// map, so you can see how coverage overlaps and where the gaps are. Free OSM tiles.
export default function CoverageMapAll({ notaries }: { notaries: CoverageNotary[] }) {
  const ref = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    import('leaflet').then((L) => {
      if (cancelled || !ref.current || mapRef.current || notaries.length === 0) return
      const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: true, attributionControl: false }).setView([32.8, -117.0], 9)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map)

      const circles: import('leaflet').Layer[] = []
      for (const n of notaries) {
        const isActive = n.status === 'active'
        const stroke = isActive ? '#7c3aed' : '#94a3b8'
        const fill = isActive ? '#a855f7' : '#94a3b8'
        const circle = L.circle([n.lat, n.lng], {
          radius: n.radiusMiles * 1609.34,
          color: stroke, fillColor: fill,
          fillOpacity: isActive ? 0.25 : 0.08,
          weight: isActive ? 3 : 1,
          dashArray: isActive ? undefined : '4',
        }).addTo(map)
        L.circleMarker([n.lat, n.lng], {
          radius: 5, color: '#ffffff', weight: 2, fillColor: fill, fillOpacity: 1,
        }).addTo(map).bindPopup(`${n.name} · ${n.radiusMiles}mi${isActive ? '' : ' (applicant)'}`)
        circles.push(circle)
      }
      const group = L.featureGroup(circles)
      map.fitBounds(group.getBounds(), { padding: [24, 24] })
      setTimeout(() => map.invalidateSize(), 50)
    })
    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [notaries])

  if (notaries.length === 0) {
    return <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-400 text-sm">No notaries with a coverage area yet.</div>
  }

  return <div ref={ref} data-lenis-prevent style={{ height: 560, width: '100%' }} className="rounded-2xl overflow-hidden border border-gray-200 z-0" />
}
