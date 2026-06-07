'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ClipboardList, Radio, CheckCircle2, FileCheck2, MapPin } from 'lucide-react'

const STEPS = [
  { icon: ClipboardList, title: 'You place the order', desc: 'Two minutes online — or one quick call.', tag: 'Order received', color: '#6366f1' },
  { icon: Radio, title: 'We alert every covering agent', desc: 'Every vetted, NNA-certified agent in range — simultaneously.', tag: 'Broadcasting to 12 agents…', color: '#8b5cf6' },
  { icon: CheckCircle2, title: 'First to accept wins', desc: 'Confirmed in ~30 minutes. No phone tag, no waiting on hold.', tag: 'Maria accepted · 22 min', color: '#a855f7' },
  { icon: FileCheck2, title: 'Documents follow the job', desc: 'Your package routes to whoever takes it — even a last-minute backup.', tag: 'Docs delivered securely', color: '#d946ef' },
  { icon: MapPin, title: 'Live-tracked to done', desc: 'Watch every step in real time. Invoiced automatically after.', tag: 'Signing complete ✓', color: '#ec4899' },
]

export default function ProcessShowcase() {
  const [active, setActive] = useState(0)
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 3000)
    return () => clearInterval(t)
  }, [inView])

  const step = STEPS[active]
  const StepIcon = step.icon

  return (
    <div ref={wrapRef} className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      {/* Left: the steps */}
      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const on = i === active
          return (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className={`w-full text-left flex items-start gap-4 rounded-2xl p-4 transition-all duration-300 ${on ? 'bg-white/[0.06] border border-white/10' : 'border border-transparent hover:bg-white/[0.03]'}`}
            >
              <div
                className="shrink-0 rounded-xl p-2.5 transition-all duration-300"
                style={{
                  background: on ? `${s.color}26` : 'rgba(255,255,255,0.05)',
                  color: on ? s.color : '#94a3b8',
                  boxShadow: on ? `0 0 24px -8px ${s.color}` : 'none',
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono ${on ? 'text-white/40' : 'text-white/20'}`}>0{i + 1}</span>
                  <h3 className={`font-bold transition-colors ${on ? 'text-white' : 'text-slate-400'}`}>{s.title}</h3>
                </div>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-slate-400 mt-1 leading-relaxed overflow-hidden"
                    >
                      {s.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </button>
          )
        })}
      </div>

      {/* Right: live animated stage */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0b0b14] p-8 sm:p-10 overflow-hidden min-h-[360px] flex flex-col items-center justify-center text-center">
        {/* shifting glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ background: `radial-gradient(circle at 50% 35%, ${step.color}33 0%, transparent 60%)` }}
          transition={{ duration: 0.8 }}
        />
        {/* progress dots */}
        <div className="absolute top-5 left-0 right-0 flex justify-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={i} className="h-1 rounded-full transition-all duration-300" style={{ width: i === active ? 26 : 8, background: i === active ? s.color : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.94 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center"
          >
            {/* icon with pulse rings */}
            <div className="relative mb-6">
              {active === 1 && [0, 1, 2].map((r) => (
                <motion.span
                  key={r}
                  className="absolute inset-0 rounded-full"
                  style={{ border: `1.5px solid ${step.color}` }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.6, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: r * 0.6, ease: 'easeOut' }}
                />
              ))}
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${step.color}26`, color: step.color, boxShadow: `0 0 50px -10px ${step.color}` }}
              >
                <StepIcon size={36} />
              </div>
            </div>

            <span
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
              style={{ background: `${step.color}1f`, color: '#fff', border: `1px solid ${step.color}55` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: step.color }} />
              {step.tag}
            </span>
            <p className="text-2xl font-black text-white mt-5 max-w-xs leading-tight">{step.title}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
