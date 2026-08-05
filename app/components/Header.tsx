'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Alfa_Slab_One } from 'next/font/google'
import GetTicketAlertsButton from './GetTicketAlertsButton'

const W_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='44'%3E%3Cpath d='M0 0 L20 34 L40 14 L60 34 L80 0' stroke='%239966CB' stroke-width='1.5' fill='none' opacity='0.15'/%3E%3C/svg%3E")`

// "The Wyn" (the news/content feed's own brand, distinct from the wtix
// ticket marketplace it lives inside) uses a bold retro slab-serif rather
// than wtix's italic shimmer script, so the two logos read as different
// products sharing one site, not the same wordmark reused twice.
const retroFont = Alfa_Slab_One({ subsets: ['latin'], weight: '400' })

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function Header() {
  const pathname = usePathname()
  const isNewsPage = pathname?.startsWith('/news')

  // /news gets its own hero treatment: "The Wyn" centered, no News/Get
  // Ticket Alerts buttons — this header *is* the page's hero here, not
  // just a nav bar, per explicit design direction. Background is the
  // exact same W_TEXTURE + dark gradient as the default wtix header
  // (not a flat/lighter purple — that was a first pass, corrected per
  // explicit feedback), so the two headers share one visual identity and
  // only the wordmark + right-side controls differ. Every other route
  // keeps the original wtix hero/nav untouched.
  if (isNewsPage) {
    return (
      <header
        className="sticky top-0 z-50 flex items-center justify-center"
        style={{
          background: `${W_TEXTURE}, linear-gradient(135deg, #060011 0%, #1a0638 45%, #2a0a50 55%, #060011 100%)`,
          height: '80px',
        }}
      >
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className={retroFont.className}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: '2rem', color: '#fff', letterSpacing: '0.02em',
            textShadow: '2px 2px 0 rgba(0,0,0,0.18)',
          }}
        >
          The Wyn
        </button>
      </header>
    )
  }

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
          onClick={scrollToTop}
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
        <div className="flex items-center gap-2">
          <Link
            href="/news"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(153,102,203,0.55)',
              borderRadius: '999px',
              padding: '0.45rem 1.1rem',
              whiteSpace: 'nowrap',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(153,102,203,0.18)'
              e.currentTarget.style.borderColor = 'rgba(153,102,203,0.9)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.borderColor = 'rgba(153,102,203,0.55)'
            }}
          >
            The Wyn
          </Link>
          <GetTicketAlertsButton />
        </div>
      </div>
    </header>
  )
}
