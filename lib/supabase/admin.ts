import { createClient } from '@supabase/supabase-js'

// Service-role client for privileged operations (signed URLs on the private
// signing-docs bucket). NEVER import this into a client component.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  })
}

export function hasServiceRole() {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
