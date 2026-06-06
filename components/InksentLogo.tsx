import Link from 'next/link'

function InksentIcon({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  // Ink drop mark (concept #2). To switch to the pen nib (#3), replace the <path>
  // with: <path d="M20 8L27.5 25L20 31.5L12.5 25L20 8Z" fill="white"/>
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill={dark ? '#7c5cff' : '#5B4FCF'} />
      <path d="M20 7C20 7 29.5 18.5 29.5 25.5C29.5 30.75 25.2 35 20 35C14.8 35 10.5 30.75 10.5 25.5C10.5 18.5 20 7 20 7Z" fill="white" />
    </svg>
  )
}

export default function InksentLogo({
  size = 'md',
  href = '/',
  dark = false,
}: {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  dark?: boolean
}) {
  const iconSize = { sm: 24, md: 32, lg: 40 }[size]
  const textClass = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size]

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 group">
      <InksentIcon size={iconSize} dark={dark} />
      <span className={`font-black ${textClass} tracking-tight leading-none`}>
        <span className={dark ? 'text-white' : 'text-gray-900'}>ink</span>
        <span className={dark ? 'text-violet-300' : 'text-violet-600'}>sent</span>
      </span>
    </Link>
  )
}
