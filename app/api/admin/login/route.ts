import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  checkAdminPassword, adminCookieName, adminTokenValue,
  twoFactorEnabled, adminEmail, generateCode, pendingCookieName, makePendingToken,
} from '@/lib/admin-auth'
import { logAudit, reqIp } from '@/lib/audit'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const password = (form?.get('password') as string) || ''
  const ip = reqIp(req)

  // Throttle password attempts (brute-force guard on the admin gate).
  if (!(await checkRateLimit(`admin-login:${ip}`, 10, 900))) {
    logAudit({ action: 'admin_login_failed', actorType: 'admin', entityType: 'auth', ip, success: false, meta: { reason: 'rate_limited' } })
    return NextResponse.redirect(new URL('/admin-login?error=rate', req.url), { status: 303 })
  }

  if (!checkAdminPassword(password)) {
    logAudit({ action: 'admin_login_failed', actorType: 'admin', entityType: 'auth', ip, success: false, meta: { reason: 'bad_password' } })
    return NextResponse.redirect(new URL('/admin-login?error=1', req.url), { status: 303 })
  }

  // Password OK. If 2FA is on, email a code and go to the code step.
  if (twoFactorEnabled()) {
    const code = generateCode()
    try {
      await new Resend(process.env.RESEND_API_KEY ?? 're_placeholder').emails.send({
        from: 'Inksent Security <orders@inksent.co>',
        to: adminEmail(),
        subject: `Your Inksent admin code: ${code}`,
        html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:420px;margin:0 auto;padding:24px;text-align:center;">
          <p style="font-size:14px;color:#555;">Your admin login code (valid 10 minutes):</p>
          <p style="font-size:34px;font-weight:800;letter-spacing:6px;color:#111;margin:12px 0;">${code}</p>
          <p style="font-size:12px;color:#999;">If you didn't try to sign in, change your admin password immediately.</p>
        </div>`,
      })
    } catch {
      return NextResponse.redirect(new URL('/admin-login?error=mail', req.url), { status: 303 })
    }

    const res = NextResponse.redirect(new URL('/admin-login?step=code', req.url), { status: 303 })
    res.cookies.set(pendingCookieName(), makePendingToken(code), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600,
    })
    logAudit({ action: 'admin_login_password_ok', actor: adminEmail(), actorType: 'admin', entityType: 'auth', ip, meta: { step: '2fa_code_sent' } })
    return res
  }

  // 2FA disabled → log in directly.
  const res = NextResponse.redirect(new URL('/dashboard', req.url), { status: 303 })
  res.cookies.set(adminCookieName(), adminTokenValue(), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12,
  })
  logAudit({ action: 'admin_login_success', actor: adminEmail(), actorType: 'admin', entityType: 'auth', ip, meta: { twofa: false } })
  return res
}
