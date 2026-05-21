// W-stroke texture repeated as a background pattern
const W_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='44'%3E%3Cpath d='M0 0 L20 34 L40 14 L60 34 L80 0' stroke='%239966CB' stroke-width='1.5' fill='none' opacity='0.15'/%3E%3C/svg%3E")`

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: `${W_TEXTURE}, linear-gradient(135deg, #060011 0%, #1a0638 45%, #2a0a50 55%, #060011 100%)`,
        height: '80px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Ambient glow */}
          <div
            style={{
              position: 'absolute',
              width: '160px',
              height: '60px',
              background: 'radial-gradient(ellipse, rgba(153,102,203,0.5) 0%, transparent 70%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
              animation: 'glow-pulse 3s ease-in-out infinite',
            }}
          />
          {/* Logo */}
          <span
            style={{
              position: 'relative',
              zIndex: 10,
              fontSize: '2.5rem',
              fontWeight: 900,
              fontStyle: 'italic',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              background:
                'linear-gradient(90deg, #fff 0%, #ddb4ff 15%, #9966CB 35%, #cc88ff 50%, #9966CB 65%, #ddb4ff 85%, #fff 100%)',
              backgroundSize: '250% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 5s linear infinite',
            }}
          >
            wtix
          </span>
        </div>
      </div>
    </header>
  )
}
