import { ImageResponse } from 'next/og'

export const alt = 'Inksent — Signing Agents, On Demand'
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
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#7c5cff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 38,
              fontWeight: 800,
              marginRight: 22,
            }}
          >
            in
          </div>
          <div style={{ display: 'flex', fontSize: 52, fontWeight: 800, letterSpacing: '-2px' }}>
            <span style={{ color: 'white' }}>ink</span>
            <span style={{ color: '#a78bfa' }}>sent</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: 74, fontWeight: 800, letterSpacing: '-3px', lineHeight: 1.05 }}>
          <span style={{ color: 'white' }}>Signing Agents,&nbsp;</span>
          <span style={{ color: '#a78bfa' }}>On Demand</span>
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#94a3b8', marginTop: 28, maxWidth: 920 }}>
          Vetted, NNA-certified notary signing agents — confirmed in ~30 minutes, with automatic backup if anyone cancels.
        </div>
      </div>
    ),
    { ...size }
  )
}
