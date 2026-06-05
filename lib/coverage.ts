import zipcodes from 'zipcodes'

export interface ZipInfo {
  zip: string
  city: string
  state: string
  latitude: number
  longitude: number
}

/** Look up a ZIP. Returns null if it's not a valid US ZIP. */
export function lookupZip(zip: string): ZipInfo | null {
  if (!/^\d{5}$/.test(zip)) return null
  const r = zipcodes.lookup(zip)
  return r && r.city ? (r as ZipInfo) : null
}

/** Miles between two ZIPs, or null if either is invalid. */
export function zipDistance(a: string, b: string): number | null {
  if (!/^\d{5}$/.test(a) || !/^\d{5}$/.test(b)) return null
  const d = zipcodes.distance(a, b)
  return typeof d === 'number' && !isNaN(d) ? d : null
}

/** Does a notary (base_zip + radius) cover a given property ZIP? */
export function notaryCoversZip(
  baseZip: string | null | undefined,
  radius: number | null | undefined,
  propertyZip: string
): boolean {
  if (!baseZip) return false
  const d = zipDistance(baseZip, propertyZip)
  if (d === null) return false
  return d <= (radius ?? 25)
}

export const RADIUS_OPTIONS = [10, 20, 30, 50] as const
