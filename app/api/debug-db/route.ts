import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// TEMP: confirms the server (service-role) can still read after RLS is enabled.
// Returns counts only — no PII. Delete after verification.
export async function GET() {
  const supabase = await createClient()
  const n = await supabase.from('notaries').select('id', { count: 'exact', head: true })
  const o = await supabase.from('orders').select('id', { count: 'exact', head: true })
  return NextResponse.json({
    serverCanRead: !n.error && !o.error,
    notaryCount: n.count ?? null,
    orderCount: o.count ?? null,
    error: n.error?.message || o.error?.message || null,
  })
}
