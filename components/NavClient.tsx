'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import InksentLogo from '@/components/InksentLogo'

export default function NavClient() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <InksentLogo size="md" />

        <div className="hidden md:flex items-center gap-7">
          {[['#how-it-works', 'How It Works'], ['#coverage', 'Coverage'], ['#features', 'Why Inksent']].map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="tel:+17605045984" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <Phone size={14} />
            (760) 504-5984
          </a>
          <Link href="/order" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm">
            Place Order
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
