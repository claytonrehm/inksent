'use client'

import { motion } from 'framer-motion'

// Glowing, slow-drifting gradient orbs for the dark hero. Pointer-events none.
export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 720, height: 720, top: '-20%', right: '-12%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.26) 0%, transparent 68%)',
        }}
        animate={{ x: [0, 30, -15, 0], y: [0, 25, 40, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600, bottom: '-18%', left: '-10%',
          background: 'radial-gradient(circle, rgba(217,70,239,0.18) 0%, transparent 68%)',
        }}
        animate={{ x: [0, -22, 15, 0], y: [0, -15, -30, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: 'easeInOut' }}
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
