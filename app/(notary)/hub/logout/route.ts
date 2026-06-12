import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'

// Cookie-aware sign-out for the notary portal — clears the Supabase auth
// session cookies, then returns to the notary login.
export async function POST(request: Request) {
  const supabase = await createAuthClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/hub/login', request.url), { status: 303 })
}
