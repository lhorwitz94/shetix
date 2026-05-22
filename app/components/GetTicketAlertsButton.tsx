'use client'

import { useState, useEffect, useRef } from 'react'

export default function GetTicketAlertsButton() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptInjected = useRef(false)

  // Inject the Beehiiv script the first time the modal opens.
  // The modal stays mounted (display toggled via CSS) so containerRef always
  // points to the same div — the script and its rendered form persist between opens.
  useEffect(() => {
    if (!open || scriptInjected.current || !containerRef.current) return
    const script = document.createElement('script')
    script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js'
    script.async = true
    script.setAttribute('data-beehiiv-form', '19c29c1a-00b3-4be4-9e8b-9b153021d308')
    containerRef.current.appendChild(script)
    scriptInjected.current = true
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* Trigger button — matches the wtix logo treatment */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(153,102,203,0.55)',
          borderRadius: '999px',
          padding: '0.45rem 1.1rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
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
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
            background:
              'linear-gradient(90deg, #fff 0%, #ddb4ff 15%, #9966CB 35%, #cc88ff 50%, #9966CB 65%, #ddb4ff 85%, #fff 100%)',
            backgroundSize: '250% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer-loop 4s linear infinite',
          }}
        >
          Get Ticket Alerts
        </span>
      </button>

      {/* Modal — always in the DOM, shown/hidden via display so the Beehiiv
          script and its rendered form survive open/close cycles. */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          display: open ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.72)',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            background: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            width: 'min(560px, 92vw)',
            aspectRatio: '16 / 9',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '10px',
              right: '12px',
              zIndex: 10,
              background: 'rgba(0,0,0,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Beehiiv form mounts here */}
          <div
            ref={containerRef}
            style={{ flex: 1, width: '100%', overflow: 'auto' }}
          />
        </div>
      </div>
    </>
  )
}
