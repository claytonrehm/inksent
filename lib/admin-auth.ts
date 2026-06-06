import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual, randomInt } from 'crypto'

// Self-contained admin gate: a strong password (ADMIN_PASSWORD) unlocks a signed,
// httpOnly session cookie. The cookie value is an HMAC over a fixed payload using
// ADMIN_SESSION_SECRET, so it can't be forged without the server secret.
// HTTPS + httpOnly + SameSite=Lax keep it safe in transit and from JS/XSS.
//
// 2FA: after the password, a 6-digit code is emailed. The pending cookie holds
// only an HMAC of the code+expiry (never the code itself), so it's stateless and
// the code is only obtainable from the email inbox.

const COOKIE = 'inksent_admin'
const PENDING = 'inksent_admin_2fa'
const PAYLOAD = 'admin-v1'

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret'
}

/** 2FA is on whenever an admin email is configured (default: always). */
export function twoFactorEnabled() {
  return process.env.ADMIN_2FA !== 'off'
}

export function adminEmail() {
  return process.env.ADMIN_2FA_EMAIL || process.env.ADMIN_EMAIL || 'clayton.rehm@gmail.com'
}

export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export const pendingCookieName = () => PENDING

/** Stateless pending token: `${expiry}.${hmac(code+expiry)}` — code is never stored. */
export function makePendingToken(code: string, ttlMs = 10 * 60 * 1000): string {
  const exp = Date.now() + ttlMs
  const mac = createHmac('sha256', secret()).update(`${code}.${exp}`).digest('hex')
  return `${exp}.${mac}`
}

export function verifyPendingToken(submittedCode: string, cookieVal: string | undefined): boolean {
  if (!cookieVal) return false
  const [expStr, mac] = cookieVal.split('.')
  const exp = Number(expStr)
  if (!exp || !mac || Date.now() > exp) return false
  const expected = createHmac('sha256', secret()).update(`${submittedCode}.${exp}`).digest('hex')
  return safeEqual(mac, expected)
}

function expectedToken(): string {
  return createHmac('sha256', secret()).update(PAYLOAD).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/** Verify a submitted password against ADMIN_PASSWORD (constant-time). */
export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return safeEqual(password, expected)
}

export function adminCookieName() {
  return COOKIE
}

export function adminTokenValue() {
  return expectedToken()
}

/** True if the current request carries a valid admin session cookie. */
export async function isAdminAuthed(): Promise<boolean> {
  // If no password is configured, fail closed in production.
  if (!process.env.ADMIN_PASSWORD) return false
  const store = await cookies()
  const val = store.get(COOKIE)?.value
  if (!val) return false
  return safeEqual(val, expectedToken())
}
