import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a0638',
        borderRadius: 7,
      }}
    >
      <span
        style={{
          color: '#cc88ff',
          fontSize: 21,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-1px',
          marginTop: 2,
        }}
      >
        W
      </span>
    </div>,
    { width: 32, height: 32 },
  )
}
