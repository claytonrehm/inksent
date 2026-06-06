import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'

// Completes a magic-link login: exchanges the code for a session cookie, then
// sends the title-company user to their portal.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/portal'

  if (code) {
    const supabase = await createAuthClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=link`)
}
