import { ImageResponse } from 'next/og'

export const alt = 'Join the Inksent Notary Network — $90 per completed signing'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#07070d',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#7c5cff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6C20 6 29 17.5 29 24.5C29 29.75 24.97 34 20 34C15.03 34 11 29.75 11 24.5C11 17.5 20 6 20 6Z" fill="white" />
              <path d="M20 28.5V20.5M20 20.5L16.8 23.7M20 20.5L23.2 23.7" stroke="#7c5cff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, letterSpacing: '-1.5px' }}>
            <span style={{ color: 'white' }}>ink</span>
            <span style={{ color: '#a78bfa' }}>sent</span>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: '#a78bfa', fontWeight: 700, letterSpacing: '3px', marginBottom: 18 }}>
          NOW ACCEPTING SIGNING AGENTS
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, letterSpacing: '-3px' }}>
          Join Our Notary Network
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 30 }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: '#a78bfa' }}>$90</div>
          <div style={{ fontSize: 32, color: '#94a3b8', marginLeft: 18 }}>per completed signing · paid to your bank account</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
