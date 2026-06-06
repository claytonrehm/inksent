import { NextResponse } from 'next/server'
import { checkAdminPassword, adminCookieName, adminTokenValue } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const password = (form?.get('password') as string) || ''

  if (!checkAdminPassword(password)) {
    return NextResponse.redirect(new URL('/admin-login?error=1', req.url), { status: 303 })
  }

  const res = NextResponse.redirect(new URL('/dashboard', req.url), { status: 303 })
  res.cookies.set(adminCookieName(), adminTokenValue(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  })
  return res
}
