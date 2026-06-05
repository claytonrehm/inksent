import { NextRequest, NextResponse } from 'next/server'
import { lookupZip } from '@/lib/coverage'

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip') ?? ''
  const info = lookupZip(zip)
  if (!info) return NextResponse.json({ found: false }, { status: 404 })
  return NextResponse.json({ found: true, city: info.city, state: info.state })
}
