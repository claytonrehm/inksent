'use client'

import { motion } from 'framer-motion'

// Glowing, slow-drifting gradient orbs for the dark hero. Pointer-events none.
export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 760, height: 760, top: '-22%', right: '-14%',
          background: 'radial-gradient(circle, rgba(124,108,240,0.16) 0%, transparent 70%)',
        }}
        animate={{ x: [0, 30, -15, 0], y: [0, 25, 40, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 640, height: 640, bottom: '-20%', left: '-12%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
        }}
        animate={{ x: [0, -22, 15, 0], y: [0, -15, -30, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* soft slate-violet glow — refined depth, not neon */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 560, height: 560, top: '30%', left: '38%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 72%)',
        }}
        animate={{ x: [0, 40, -30, 0], y: [0, -28, 20, 0] }}
        transition={{ duration: 46, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* faint dot grid for texture */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  )
}
