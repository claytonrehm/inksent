'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

// Small interactive coverage map: a marker at the notary's home ZIP + a circle
// showing how far their travel radius reaches. Uses free OpenStreetMap tiles
// (no API key). Leaflet is loaded lazily so it never runs during SSR.
export default function CoverageMap({
  lat, lng, radiusMiles, label,
}: { lat: number; lng: number; radiusMiles: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    import('leaflet').then((L) => {
      if (cancelled || !ref.current || mapRef.current) return
      const map = L.map(ref.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: false }).setView([lat, lng], 9)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map)
      const circle = L.circle([lat, lng], {
        radius: radiusMiles * 1609.34,
        color: '#7c3aed', fillColor: '#a855f7', fillOpacity: 0.30, weight: 3,
      }).addTo(map)
      L.circleMarker([lat, lng], {
        radius: 6, color: '#ffffff', weight: 2, fillColor: '#7c3aed', fillOpacity: 1,
      }).addTo(map).bindPopup(`${label} · ${radiusMiles}mi radius`)
      map.fitBounds(circle.getBounds(), { padding: [12, 12] })
      // tiles sometimes need a nudge to render in a freshly-shown container
      setTimeout(() => map.invalidateSize(), 50)
    })
    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [lat, lng, radiusMiles, label])

  return <div ref={ref} style={{ height: 280, width: '100%' }} className="rounded-xl overflow-hidden border border-gray-200 z-0" />
}
