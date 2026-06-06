'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// A clean phone showing the actual job-offer text a notary receives — makes the
// (software) product tangible in the hero.
export default function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: 290 }}>
      {/* glow behind phone */}
      <div className="absolute -inset-8 rounded-[3rem] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="relative rounded-[2.6rem] border border-white/15 bg-[#0d0d14] p-2.5 shadow-2xl"
        style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8)' }}
      >
        {/* notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10" />

        <div className="rounded-[2.1rem] overflow-hidden bg-[#0a0a10]">
          {/* header */}
          <div className="pt-8 pb-3 px-4 text-center border-b border-white/5 bg-white/[0.02]">
            <div className="w-9 h-9 rounded-full bg-violet-600 mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-black">in</div>
            <div className="text-white text-sm font-semibold">Inksent Signing</div>
            <div className="text-slate-500 text-[11px]">(619) 949-3361</div>
          </div>

          {/* message */}
          <div className="p-4 space-y-3 min-h-[300px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-[#26262e] rounded-2xl rounded-tl-md p-3.5 text-[12.5px] leading-relaxed text-slate-100 max-w-[85%]"
            >
              <span className="text-violet-300 font-semibold">New signing — $90</span><br/>
              Refinance · Mon, Jun 16 · 10:00 AM<br/>
              La Jolla, CA 92037<br/>
              <span className="text-slate-400">Tap to accept — first wins.</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.1 }}
              className="ml-auto flex items-center gap-1.5 bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-full"
            >
              <Check size={13} /> Accept signing
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.6 }}
              className="bg-violet-600 rounded-2xl rounded-tr-md p-3 text-[12.5px] text-white max-w-[80%] ml-auto"
            >
              ✅ You&apos;re confirmed! Docs are on the way.
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
