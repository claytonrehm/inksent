// Cloudflare Turnstile — bot/CAPTCHA verification for public forms.
// Gracefully disabled until TURNSTILE_SECRET_KEY is set, so the site keeps
// working before you add keys. Once keys exist, verification is enforced.

export function turnstileEnabled() {
  return !!process.env.TURNSTILE_SECRET_KEY
}

/** Verify a Turnstile token server-side. Returns true if CAPTCHA is disabled. */
export async function verifyTurnstile(token: string | undefined | null, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured yet → don't block submissions
  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    })
    const data = (await res.json()) as { success: boolean }
    return !!data.success
  } catch {
    return false
  }
}
