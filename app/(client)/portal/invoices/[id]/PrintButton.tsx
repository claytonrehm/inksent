'use client'
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700"
    >
      Print / Save PDF
    </button>
  )
}
