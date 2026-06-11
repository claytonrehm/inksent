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
  { href: '/partners', label: 'Title Companies', external: true },
  { href: '/join', label: 'Notaries', external: true },
]

export default function NavClient() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const solid = scrolled || menuOpen

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: solid ? 'rgba(7,7,13,0.85)' : 'transparent',
          backdropFilter: solid ? 'blur(14px)' : 'none',
          borderBottom: solid ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <InksentLogo size="md" dark />

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label, external }) =>
              external ? (
                <Link key={href} href={href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{label}</Link>
              ) : (
                <a key={href} href={href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{label}</a>
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            <a href="tel:+16199493361" className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors font-medium">
              <Phone size={14} /> (619) 949-3361
            </a>
            <Link href="/login" className="hidden md:inline-flex text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign in</Link>
            <Link href="/order" className="hidden md:inline-flex bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-[0_0_24px_-8px_rgba(217,70,239,0.8)] hover:shadow-[0_0_30px_-6px_rgba(217,70,239,0.9)]">
              Place Order
            </Link>
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label, external }) =>
                  external ? (
                    <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="py-3 px-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{label}</Link>
                  ) : (
                    <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-3 px-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{label}</a>
                  )
                )}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                  <a href="tel:+16199493361" className="flex items-center gap-2 py-3 px-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Phone size={16} /> (619) 949-3361
                  </a>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="py-3 px-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Sign in to portal</Link>
                  <Link href="/order" onClick={() => setMenuOpen(false)} className="w-full text-center bg-violet-600 text-white px-4 py-3 rounded-xl text-base font-bold hover:bg-violet-500 transition-colors">
                    Place an Order
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
