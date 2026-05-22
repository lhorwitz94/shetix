'use client'

import { useState, useEffect, useRef } from 'react'

export default function GetTicketAlertsButton() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptInjected = useRef(false)

  // Inject the Beehiiv script the first time the modal opens.
  // The loader looks for its own script tag in the DOM and renders
  // the form adjacent to it, so we append it into the modal container.
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: '#9966CB',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.8rem',
          padding: '0.45rem 1rem',
          borderRadius: '999px',
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Get Ticket Alerts
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
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
      )}
    </>
  )
}
