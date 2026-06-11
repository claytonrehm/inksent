import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  adminCookieName, adminTokenValue, pendingCookieName, verifyPendingToken, adminEmail,
} from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const code = ((form?.get('code') as string) || '').trim()
  const ip = reqIp(req)

  const store = await cookies()
  const pending = store.get(pendingCookieName())?.value

  if (!verifyPendingToken(code, pending)) {
    logAudit({ action: 'admin_login_failed', actorType: 'admin', entityType: 'auth', ip, success: false, meta: { reason: 'bad_2fa_code' } })
    return NextResponse.redirect(new URL('/admin-login?step=code&error=code', req.url), { status: 303 })
  }

  logAudit({ action: 'admin_login_success', actor: adminEmail(), actorType: 'admin', entityType: 'auth', ip, meta: { twofa: true } })
  const res = NextResponse.redirect(new URL('/dashboard', req.url), { status: 303 })
  // Issue the real session, clear the pending 2FA cookie.
  res.cookies.set(adminCookieName(), adminTokenValue(), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12,
  })
  res.cookies.set(pendingCookieName(), '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
