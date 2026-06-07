'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ClipboardList, Radio, CheckCircle2, FileCheck2, MapPin,
  Smartphone, FileText, Navigation, Banknote,
} from 'lucide-react'

type Step = {
  icon: React.ComponentType<{ size?: number }>
  title: string
  desc: string
  tag: string
  color: string
  pulse?: boolean
}

const TITLE_STEPS: Step[] = [
  { icon: ClipboardList, title: 'You place the order', desc: 'Two minutes online — or one quick call.', tag: 'Order received', color: '#6366f1' },
  { icon: Radio, title: 'We alert every covering agent', desc: 'Every vetted, NNA-certified agent in range — at the same instant.', tag: 'Broadcasting to 12 agents…', color: '#8b5cf6', pulse: true },
  { icon: CheckCircle2, title: 'First to accept wins', desc: 'Confirmed in ~30 minutes. No phone tag, no waiting on hold.', tag: 'Maria accepted · 22 min', color: '#a855f7' },
  { icon: FileCheck2, title: 'Documents follow the job', desc: 'Your package routes to whoever takes it — even a last-minute backup.', tag: 'Docs delivered securely', color: '#d946ef' },
  { icon: MapPin, title: 'Live-tracked to done', desc: 'Watch every milestone in real time. Invoiced automatically after.', tag: 'Signing complete ✓', color: '#ec4899' },
]

const NOTARY_STEPS: Step[] = [
  { icon: Smartphone, title: 'A job pops up nearby', desc: 'We text + email you signings inside your coverage area.', tag: 'New signing · $90', color: '#6366f1', pulse: true },
  { icon: CheckCircle2, title: 'Tap to accept', desc: 'First to accept gets it — no bidding, no phone tag.', tag: 'You’re confirmed', color: '#8b5cf6' },
  { icon: FileText, title: 'Docs come to you', desc: 'The full package arrives securely — print and you’re ready.', tag: 'Documents ready', color: '#a855f7' },
  { icon: Navigation, title: 'Show up & sign', desc: 'Tap your status so everyone stays in the loop.', tag: 'On the way · Arrived', color: '#d946ef' },
  { icon: Banknote, title: 'Get paid', desc: 'Straight to your bank after the client pays — automatic.', tag: '$90 deposited', color: '#ec4899' },
]

export default function ProcessShowcase() {
  const [audience, setAudience] = useState<'title' | 'notary'>('title')
  const [active, setActive] = useState(0)
  const steps = audience === 'title' ? TITLE_STEPS : NOTARY_STEPS
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { margin: '-80px' })

  useEffect(() => { setActive(0) }, [audience])
  useEffect(() => {
    if (!inView) return
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), 3400)
    return () => clearInterval(t)
  }, [inView, steps.length, audience])

  const step = steps[active]
  const StepIcon = step.icon

  return (
    <div ref={wrapRef}>
      {/* Audience toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
          {(['title', 'notary'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAudience(a)}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-colors ${audience === a ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {audience === a && (
                <motion.span layoutId="audiencePill" className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{a === 'title' ? 'For Title Companies' : 'For Notaries'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left: steps (descriptions always visible — no reflow jank) */}
        <div className="space-y-1.5">
          {steps.map((s, i) => {
            const Icon = s.icon
            const on = i === active
            return (
              <button
                key={`${audience}-${i}`}
                onClick={() => setActive(i)}
                className={`w-full text-left flex items-start gap-4 rounded-2xl p-4 transition-all duration-500 ${on ? 'bg-white/[0.06] border border-white/10' : 'border border-transparent opacity-60 hover:opacity-90'}`}
              >
                <div
                  className="shrink-0 rounded-xl p-2.5 transition-all duration-500"
                  style={{
                    background: on ? `${s.color}26` : 'rgba(255,255,255,0.05)',
                    color: on ? s.color : '#94a3b8',
                    boxShadow: on ? `0 0 24px -8px ${s.color}` : 'none',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono ${on ? 'text-white/40' : 'text-white/20'}`}>0{i + 1}</span>
                    <h3 className={`font-bold transition-colors duration-500 ${on ? 'text-white' : 'text-slate-400'}`}>{s.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right: live animated stage (smooth crossfade) */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0b0b14] p-8 sm:p-10 overflow-hidden min-h-[360px] flex flex-col items-center justify-center text-center">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ background: `radial-gradient(circle at 50% 35%, ${step.color}33 0%, transparent 60%)` }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
          />
          <div className="absolute top-5 left-0 right-0 flex justify-center gap-1.5">
            {steps.map((s, i) => (
              <div key={i} className="h-1 rounded-full transition-all duration-500" style={{ width: i === active ? 26 : 8, background: i === active ? s.color : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${audience}-${active}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center"
            >
              <div className="relative mb-6">
                {step.pulse && [0, 1, 2].map((r) => (
                  <motion.span
                    key={r}
                    className="absolute inset-0 rounded-full"
                    style={{ border: `1.5px solid ${step.color}` }}
                    initial={{ scale: 1, opacity: 0.55 }}
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
    </div>
  )
}
