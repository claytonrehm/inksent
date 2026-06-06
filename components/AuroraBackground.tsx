'use client'

import { motion } from 'framer-motion'

// Glowing, slow-drifting gradient orbs for the dark hero. Pointer-events none.
export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 680, height: 680, top: '-16%', right: '-8%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.40) 0%, transparent 65%)',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, 50, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 560, height: 560, bottom: '-12%', left: '-8%',
          background: 'radial-gradient(circle, rgba(217,70,239,0.30) 0%, transparent 65%)',
        }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, -40, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 460, height: 460, top: '20%', left: '42%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 65%)',
        }}
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0], scale: [1, 0.9, 1.12, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* faint dot grid for texture */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
    </div>
  )
}
