'use client'

import { motion } from 'framer-motion'

// Subtle, slow-drifting gradient orbs. Sits behind content, pointer-events none.
export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 640, height: 640, top: '-12%', right: '-8%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, 50, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 520, height: 520, bottom: '-10%', left: '-6%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
        }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, -40, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 420, height: 420, top: '30%', left: '45%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
        }}
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0], scale: [1, 0.9, 1.12, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* faint dot grid for texture */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(rgba(124,58,237,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}
