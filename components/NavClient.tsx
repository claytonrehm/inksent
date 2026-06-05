'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Phone, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import InksentLogo from '@/components/InksentLogo'

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works', external: false },
  { href: '#coverage', label: 'Coverage', external: false },
  { href: '#pricing', label: 'Pricing', external: false },
  { href: '/apply', label: 'Join as Notary', external: true },
]

export default function NavClient() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled || menuOpen ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
          borderBottom: scrolled || menuOpen ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
          boxShadow: scrolled || menuOpen ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <InksentLogo size="md" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label, external }) =>
              external ? (
                <Link key={href} href={href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  {label}
                </Link>
              ) : (
                <a key={href} href={href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  {label}
                </a>
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            <a href="tel:+16199493361" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
              <Phone size={14} />
              (619) 949-3361
            </a>
            <Link href="/order" className="hidden md:inline-flex bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm">
              Place Order
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label, external }) =>
                  external ? (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="py-3 px-3 text-base font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="py-3 px-3 text-base font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                    >
                      {label}
                    </a>
                  )
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                  <a
                    href="tel:+16199493361"
                    className="flex items-center gap-2 py-3 px-3 text-base font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  >
                    <Phone size={16} />
                    (619) 949-3361
                  </a>
                  <Link
                    href="/order"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center bg-violet-600 text-white px-4 py-3 rounded-xl text-base font-bold hover:bg-violet-700 transition-colors shadow-sm"
                  >
                    Place an Order
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Overlay to close menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
