'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setCount(target)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return { count, ref }
}

function StatItem({ value, suffix, label, color }: { value: number; suffix: string; label: string; color: string }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <div className={`text-4xl sm:text-5xl font-black ${color}`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-500 text-sm mt-1 font-medium">{label}</div>
    </div>
  )
}

export default function HeroStats() {
  return (
    <div className="grid grid-cols-3 gap-6 sm:gap-12 py-8">
      <StatItem value={50} suffix="" label="States Covered" color="text-gray-900" />
      <StatItem value={30} suffix=" min" label="Avg. Confirmation" color="text-violet-600" />
      <StatItem value={100} suffix="%" label="NNA Certified" color="text-gray-900" />
    </div>
  )
}
