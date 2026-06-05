declare module 'zipcodes' {
  interface ZipEntry {
    zip: string
    latitude: number
    longitude: number
    city: string
    state: string
    country: string
  }
  export function lookup(zip: string | number): ZipEntry | undefined
  export function distance(zipA: string | number, zipB: string | number): number | undefined
  export function radius(zip: string | number, miles: number): string[]
  export function lookupByName(city: string, state: string): ZipEntry[]
  export function lookupByState(state: string): ZipEntry[]
  const _default: {
    lookup: typeof lookup
    distance: typeof distance
    radius: typeof radius
    lookupByName: typeof lookupByName
    lookupByState: typeof lookupByState
  }
  export default _default
}
