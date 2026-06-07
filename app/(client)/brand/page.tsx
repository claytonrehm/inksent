/* Logo concept comparison — visit /brand to pick an icon. Internal use. */
export const metadata = { title: 'Brand Concepts — Inksent' }

type IconProps = { size?: number }

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#7c5cff' }}>
      {children}
    </div>
  )
}

const drop = "M20 6C20 6 29 17.5 29 24.5C29 29.75 24.97 34 20 34C15.03 34 11 29.75 11 24.5C11 17.5 20 6 20 6Z"

const ICONS: { name: string; note: string; svg: React.ReactNode }[] = [
  {
    name: 'Send Drop  ⭐',
    note: 'Ink drop + an upward "sent" arrow inside. Ink + sent in one mark — the smartest, most ownable.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d={drop} fill="#fff" /><path d="M20 28.5V20.5M20 20.5L16.8 23.7M20 20.5L23.2 23.7" stroke="#7c5cff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    name: 'Signed Drop',
    note: 'Ink drop + checkmark = "ink, signed." Trust + completion.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d={drop} fill="#fff" /><path d="M16 24.5l2.6 2.6 5.6-6.2" stroke="#7c5cff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    name: 'Pin Drop',
    note: 'Drop doubles as a map pin = "signings dispatched anywhere."',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d={drop} fill="#fff" /><circle cx="20" cy="24" r="3.6" fill="#7c5cff" /></svg>,
  },
  {
    name: 'Nib Drop',
    note: 'Ink drop with a pen-nib slit. Signing + ink, refined.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d={drop} fill="#fff" /><path d="M20 18.5V27" stroke="#7c5cff" strokeWidth="1.8" strokeLinecap="round" /><circle cx="20" cy="28.5" r="1.7" fill="#7c5cff" /></svg>,
  },
  {
    name: 'Plain Drop (current)',
    note: 'What’s live now. Clean but, as you said, a bit basic.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d={drop} fill="#fff" /></svg>,
  },
  {
    name: 'Pen Nib',
    note: 'Most literal to signing. Classic but busier when small.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d="M20 7L28 25L20 33L12 25L20 7Z" fill="#fff" /><circle cx="20" cy="24" r="2.4" fill="#7c5cff" /><path d="M20 26.5L20 33" stroke="#7c5cff" strokeWidth="1.4" /></svg>,
  },
]

function Wordmark({ dark }: { dark: boolean }) {
  return (
    <span className="text-2xl font-black tracking-tight leading-none">
      <span style={{ color: dark ? '#fff' : '#111827' }}>ink</span>
      <span style={{ color: dark ? '#a78bfa' : '#7c3aed' }}>sent</span>
    </span>
  )
}

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Logo Concepts</h1>
        <p className="text-gray-500 mb-8">Tell Claude the number you like (or mix-and-match). Each shown on light + dark.</p>

        <div className="space-y-4">
          {ICONS.map((ic, i) => (
            <div key={ic.name} className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-900">{i + 1}. {ic.name}</span>
                <span className="text-xs text-gray-400 hidden sm:block">{ic.note}</span>
              </div>
              <div className="grid grid-cols-2">
                <div className="flex items-center gap-3 p-6 bg-white">
                  <Box>{ic.svg}</Box>
                  <Wordmark dark={false} />
                </div>
                <div className="flex items-center gap-3 p-6" style={{ background: '#07070d' }}>
                  <Box>{ic.svg}</Box>
                  <Wordmark dark={true} />
                </div>
              </div>
              <div className="px-5 py-2 sm:hidden text-xs text-gray-400">{ic.note}</div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-8">
          On the font: the current bold geometric sans is clean and professional — I&apos;d keep it. The name &ldquo;inksent&rdquo; and the two-tone split are strong; only the icon needs a decision.
        </p>
      </div>
    </main>
  )
}
