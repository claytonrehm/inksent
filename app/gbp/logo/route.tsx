import { ImageResponse } from 'next/og'

// Square brand logo (1024×1024) for the Google Business Profile logo/icon slot.
// Open inksent.co/gbp/logo and Save Image, then upload to GBP.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#5B4FCF',
          fontFamily: 'sans-serif',
        }}
      >
        <svg width="400" height="400" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6C20 6 29 17.5 29 24.5C29 29.75 24.97 34 20 34C15.03 34 11 29.75 11 24.5C11 17.5 20 6 20 6Z" fill="white" />
          <path d="M20 28.5V20.5M20 20.5L16.8 23.7M20 20.5L23.2 23.7" stroke="#5B4FCF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ display: 'flex', fontSize: 150, fontWeight: 800, letterSpacing: '-7px', color: 'white', marginTop: -4 }}>
          inksent
        </div>
      </div>
    ),
    { width: 1024, height: 1024 },
  )
}
