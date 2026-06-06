import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSbClient } from '@supabase/supabase-js'

// PRIMARY server data client — uses the SERVICE-ROLE key and bypasses RLS.
// This is the ONLY trusted path that may read/write tables once RLS is enabled.
// Server-only. NEVER import into a client component. The public anon key is
// blocked by RLS, so PII can no longer be dumped via the public REST endpoint.
export async function createClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Production must have the service-role key set. Fall back to anon only in
  // local dev where the key may be absent (RLS should be off locally then).
  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSbClient(url, key, { auth: { persistSession: false } })
}

// AUTH-ONLY client — cookie-aware anon client used solely to read the logged-in
// user's session (Supabase Auth) for the client portal. Does NOT bypass RLS.
export async function createAuthClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
