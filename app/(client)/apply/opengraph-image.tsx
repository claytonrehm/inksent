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
              fontSize: 34,
              fontWeight: 800,
              marginRight: 20,
            }}
          >
            in
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
          <div style={{ fontSize: 32, color: '#94a3b8', marginLeft: 18 }}>per completed signing · paid to your bank</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
