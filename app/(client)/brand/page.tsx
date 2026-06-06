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

const ICONS: { name: string; note: string; svg: React.ReactNode }[] = [
  {
    name: 'Current — Diamond',
    note: 'Abstract. Doesn’t signal signing/ink.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d="M20 8 L30 20 L20 27 L10 20 Z" fill="#fff" opacity="0.95" /><circle cx="20" cy="31" r="2" fill="#fff" opacity="0.65" /></svg>,
  },
  {
    name: 'Ink Drop',
    note: 'Literal nod to “ink.” Simple, modern, ownable.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d="M20 6C20 6 29 17.5 29 24.5C29 29.75 24.97 34 20 34C15.03 34 11 29.75 11 24.5C11 17.5 20 6 20 6Z" fill="#fff" /></svg>,
  },
  {
    name: 'Pen Nib',
    note: 'Signing / signature. Classic, professional.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d="M20 7L28 25L20 33L12 25L20 7Z" fill="#fff" /><circle cx="20" cy="24" r="2.4" fill="#7c5cff" /><path d="M20 26.5L20 33" stroke="#7c5cff" strokeWidth="1.4" /></svg>,
  },
  {
    name: 'Paper Plane',
    note: 'Nods to “sent” / dispatch. Fast, friendly.',
    svg: <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><path d="M32 8L8 19L17.5 22.5L21 32L25 22L32 8Z" fill="#fff" /><path d="M17.5 22.5L25 14" stroke="#7c5cff" strokeWidth="1.3" /></svg>,
  },
  {
    name: 'Notary Seal',
    note: 'Most literal to “notary.” Trust/authority.',
    svg: <svg width="28" height="28" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="11" stroke="#fff" strokeWidth="2" /><circle cx="20" cy="20" r="6.5" stroke="#fff" strokeWidth="1.4" /><path d="M17 20l2 2 4-4.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    name: 'Signature Check',
    note: 'A signing stroke + completion. Dynamic.',
    svg: <svg width="28" height="28" viewBox="0 0 40 40" fill="none"><path d="M9 25c5 2 8-1 9-5s2-7 4-7 1 6 0 9 1 5 4 3 4-4 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" /></svg>,
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
            <div key={ic.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
