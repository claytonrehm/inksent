'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Attorney states removed: CT, DE, GA, KS, KY, LA, ME, MD, MA, MS, NH, NJ, NY, NC, ND, OH, OR, PA, RI, SC, VT, VA, WV
const COVERED_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'FL', name: 'Florida' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'WA', name: 'Washington' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

export default function StatesGrid() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
      {COVERED_STATES.map(({ code, name }, i) => (
        <motion.div
          key={code}
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.015, duration: 0.3, ease: 'easeOut' }}
          onHoverStart={() => setHovered(code)}
          onHoverEnd={() => setHovered(null)}
        >
          <motion.span
            className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-default select-none
              ${hovered === code
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-white border-gray-200 text-gray-600'
              }`}
            whileHover={{ scale: 1.15, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {code}
          </motion.span>
          <AnimatePresence>
            {hovered === code && (
              <motion.div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none"
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                {name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}
