'use client'

import { useEffect, useRef } from 'react'
import type { NewsItem } from '@/lib/news'

function getYouTubeVideoId(url: string): string | null {
  try {
    return new URL(url).searchParams.get('v')
  } catch {
    return null
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Shared by both video and article previews (one modal system, not two) —
// content differs by item.contentType, but the shell (overlay, box,
// close button, escape/click-outside/focus handling) is the same either
// way. Visual language (overlay opacity, border radius, close-button
// treatment) matches the existing EventDetailModal in CalendarClient.tsx
// and the Beehiiv modal in GetTicketAlertsButton.tsx rather than
// inventing a new modal style.
export default function PreviewModal({ item, onClose }: { item: NewsItem | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!item) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus()
    }
  }, [item, onClose])

  if (!item) return null

  const isVideo = item.contentType === 'video'
  const videoId = isVideo ? getYouTubeVideoId(item.link) : null
  const dateLabel = formatDate(item.publishedAt)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)', padding: 16,
      }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        style={{
          background: '#fff', borderRadius: 20, width: 'min(560px, 92vw)',
          maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        }}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 12, right: 14, zIndex: 10,
            background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
            width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {isVideo && videoId ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000', borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={item.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '20px 20px 0 0', display: 'block' }}
          />
        ) : null}

        <div style={{ padding: '20px 24px 24px' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            padding: '3px 10px', borderRadius: 999, marginBottom: 12,
            background: '#f3e8ff', color: '#9966CB',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {item.league}
          </span>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.35, marginBottom: 6 }}>
            {item.title}
          </h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
            {item.source}{dateLabel ? ` · ${dateLabel}` : ''}
          </p>

          {!isVideo && item.excerpt && (
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 20 }}>
              {item.excerpt}
              {/* lib/news.ts slices RSS excerpts at exactly 160 chars — an
                  ellipsis signals there's more rather than looking like a
                  sentence that just stops mid-word. */}
              {item.excerpt.length === 160 ? '…' : ''}
            </p>
          )}

          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '12px 16px', borderRadius: 12,
              background: '#9966CB', color: '#fff', fontSize: 14, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {isVideo ? 'Watch on YouTube' : `Continue reading on ${item.source}`}
          </a>
        </div>
      </div>
    </div>
  )
}
