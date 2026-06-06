'use client'

import { useEffect, useRef } from 'react'

// Renders the Cloudflare Turnstile widget and writes its token into a hidden
// input named `cf-turnstile-response`. Renders nothing until a site key is set,
// so forms keep working before CAPTCHA keys are configured.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; theme?: string }) => string
      reset: (id?: string) => void
    }
  }
}

export default function Turnstile({ onToken }: { onToken?: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return
    const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

    function render() {
      if (!window.turnstile || !ref.current || ref.current.childElementCount > 0) return
      window.turnstile.render(ref.current, {
        sitekey: siteKey!,
        theme: 'auto',
        callback: (t: string) => onToken?.(t),
      })
    }

    if (!document.querySelector(`script[src="${SCRIPT}"]`)) {
      const s = document.createElement('script')
      s.src = SCRIPT
      s.async = true
      s.defer = true
      s.onload = render
      document.head.appendChild(s)
    } else {
      render()
    }
  }, [siteKey, onToken])

  if (!siteKey) return null
  return <div ref={ref} className="my-2" />
}
