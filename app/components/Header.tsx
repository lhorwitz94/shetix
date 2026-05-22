'use client'

import GetTicketAlertsButton from './GetTicketAlertsButton'

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo — click scrolls to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                animation: 'shimmer-once 1.6s cubic-bezier(0.2, 0.8, 0.3, 1) 0.2s both',
              }}
            >
              wtix
            </span>
          </div>
        </button>

        {/* Right side */}
        <GetTicketAlertsButton />
      </div>
    </header>
  )
}
