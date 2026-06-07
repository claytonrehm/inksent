import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Clean, consistent back button — a subtle pill with a shadow and a little
// arrow-slide on hover. `dark` variant for dark backgrounds.
export default function BackLink({
  href = '/',
  label = 'Back to home',
  dark = false,
}: { href?: string; label?: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 text-sm font-medium rounded-full px-3.5 py-1.5 border transition-all duration-200 ${
        dark
          ? 'text-slate-300 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 hover:text-white'
          : 'text-gray-600 bg-white border-gray-200 shadow-sm hover:shadow-md hover:text-violet-600 hover:border-violet-200'
      }`}
    >
      <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
      {label}
    </Link>
  )
}
