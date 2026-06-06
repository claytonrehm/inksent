import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

// Self-contained admin gate: a strong password (ADMIN_PASSWORD) unlocks a signed,
// httpOnly session cookie. The cookie value is an HMAC over a fixed payload using
// ADMIN_SESSION_SECRET, so it can't be forged without the server secret.
// HTTPS + httpOnly + SameSite=Lax keep it safe in transit and from JS/XSS.

const COOKIE = 'inksent_admin'
const PAYLOAD = 'admin-v1'

function expectedToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret'
  return createHmac('sha256', secret).update(PAYLOAD).digest('hex')
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
