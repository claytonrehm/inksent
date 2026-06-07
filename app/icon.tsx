import { ImageResponse } from 'next/og'

// PNG favicon (Google-friendly) of the Inksent "Send Drop" mark — a violet
// rounded square with the white ink drop. PNG renders reliably in Google search
// results and every browser, unlike an SVG-only favicon.
export const size = { width: 96, height: 96 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#5B4FCF',
          borderRadius: 20,
        }}
      >
        <svg width="62" height="62" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6C20 6 29 17.5 29 24.5C29 29.75 24.97 34 20 34C15.03 34 11 29.75 11 24.5C11 17.5 20 6 20 6Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
