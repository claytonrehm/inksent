'use client'

import { useState } from 'react'
import { Gift, Copy, Check } from 'lucide-react'

export default function ReferralCard({ link, bounty, referred, earned }: {
  link: string
  bounty: string
  referred: number
  earned: string
}) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }).catch(() => {})
  }
  return (
    <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
      <div className="flex items-center gap-2 mb-1"><Gift size={18} /><h2 className="font-black text-lg">Refer a notary, earn {bounty}</h2></div>
      <p className="text-violet-100 text-sm mb-4">Share your link. When someone you refer completes their first Inksent signing, {bounty} lands in your bank automatically — no limit.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="flex-1 rounded-lg bg-white/15 border border-white/25 px-3 py-2.5 text-sm text-white" />
        <button onClick={copy} className="bg-white text-violet-700 font-bold px-5 py-2.5 rounded-lg hover:bg-violet-50 flex items-center justify-center gap-1.5 shrink-0">
          {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}
        </button>
      </div>
      {referred > 0 && <p className="text-violet-100 text-xs mt-3">You&apos;ve referred {referred} {referred === 1 ? 'notary' : 'notaries'} · earned {earned} so far. 🙌</p>}
    </div>
  )
}
