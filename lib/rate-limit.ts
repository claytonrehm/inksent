import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

// Best-effort client IP from the proxy headers (Vercel sets x-forwarded-for).
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}

// Returns true if the request is allowed, false if `key` has exceeded `limit`
// within `windowSeconds`. FAILS OPEN: if the limiter is unavailable (e.g. the
// migration hasn't been applied yet, or the DB hiccups) we allow the request so
// real users are never blocked by an infrastructure problem.
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (error) return true
    return data === true
  } catch {
    return true
  }
}
