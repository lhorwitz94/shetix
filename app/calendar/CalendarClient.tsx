'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { Event } from '@/lib/types'

const SPORT_COLORS: Record<string, { bg: string; text: string }> = {
  WNBA:    { bg: '#fff3e0', text: '#c05000' },
  NWSL:    { bg: '#e6f7ef', text: '#1a7a4a' },
  PWHL:    { bg: '#e0f7fa', text: '#006878' },
  Tennis:  { bg: '#f3ffe0', text: '#4a7000' },
  Golf:    { bg: '#e8f5e9', text: '#2e7d32' },
  College: { bg: '#e3f2fd', text: '#1565c0' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function padDate(n: number) { return String(n).padStart(2, '0') }

function getCalendarCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

// ── Modals ────────────────────────────────────────────────────────────────────

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
      }}
    >
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      style={{
        position: 'absolute', top: 12, right: 14, zIndex: 10,
        background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%',
        width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#555',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >✕</button>
  )
}

function EventDetailModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const colors = SPORT_COLORS[event.sport] ?? { bg: '#f3f4f6', text: '#374151' }
  return (
    <Overlay onClose={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: 'min(440px, 92vw)',
        padding: '28px 28px 24px', position: 'relative',
      }}>
        <CloseBtn onClose={onClose} />
        <span
          style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            padding: '3px 10px', borderRadius: 999, marginBottom: 14,
            background: colors.bg, color: colors.text, letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {event.sport}
        </span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 16 }}>
          {event.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row icon="📅" label={formatFullDate(event.date)} />
          <Row icon="🕐" label={`${event.time} ET`} />
          <Row icon="📍" label={`${event.venue} · ${event.city}, ${event.state}`} />
        </div>
      </div>
    </Overlay>
  )
}

function Row({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 15, lineHeight: '20px', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#444', lineHeight: '20px' }}>{label}</span>
    </div>
  )
}

function DayModal({
  date, dayEvents, onClose, onSelectEvent,
}: {
  date: string; dayEvents: Event[]; onClose: () => void; onSelectEvent: (e: Event) => void
}) {
  return (
    <Overlay onClose={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, width: 'min(480px, 92vw)',
        maxHeight: '80vh', overflowY: 'auto', padding: '24px 24px 20px',
        position: 'relative',
      }}>
        <CloseBtn onClose={onClose} />
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 16 }}>
          {formatFullDate(date)}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dayEvents.map(e => {
            const colors = SPORT_COLORS[e.sport] ?? { bg: '#f3f4f6', text: '#374151' }
            return (
              <button
                key={e.id}
                onClick={() => onSelectEvent(e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12,
                  padding: '10px 14px', cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={el => (el.currentTarget.style.borderColor = '#9966CB')}
                onMouseLeave={el => (el.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  background: colors.bg, color: colors.text, flexShrink: 0,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  {e.sport}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111', flex: 1, minWidth: 0 }}
                  className="truncate">
                  {e.title}
                </span>
                <span style={{ fontSize: 12, color: '#888', flexShrink: 0, fontWeight: 600 }}>
                  {e.time} ET
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </Overlay>
  )
}

// ── Calendar pill (clickable) ─────────────────────────────────────────────────

function EventPill({ event, onClick }: { event: Event; onClick: () => void }) {
  const colors = SPORT_COLORS[event.sport] ?? { bg: '#f3f4f6', text: '#374151' }
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 mb-0.5 min-w-0 w-full text-left hover:opacity-80 transition-opacity"
      style={{ background: colors.bg }}
    >
      <span className="text-[9px] font-bold shrink-0 uppercase tracking-wide" style={{ color: colors.text }}>
        {event.sport}
      </span>
      <span className="text-[10px] text-gray-700 truncate">{event.title}</span>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'event'; event: Event }
  | { type: 'day'; date: string; events: Event[] }
  | null

export default function CalendarClient({ events }: { events: Event[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [modal, setModal] = useState<ModalState>(null)

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return map
  }, [events])

  const cells = useMemo(() => getCalendarCells(year, month), [year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back link */}
      <div className="mb-4">
        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to listings
        </Link>
      </div>

      {/* Month nav + legend — centered */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-[#9966CB] hover:text-[#9966CB] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 w-44 text-center">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-[#9966CB] hover:text-[#9966CB] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {Object.entries(SPORT_COLORS).map(([sport, colors]) => (
            <span key={sport} className="flex items-center gap-1 text-xs font-semibold" style={{ color: colors.text }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.text }} />
              {sport}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dateStr = day ? `${year}-${padDate(month + 1)}-${padDate(day)}` : null
            const dayEvents = dateStr ? (eventsByDate.get(dateStr) ?? []) : []
            const isToday = dateStr === `${today.getFullYear()}-${padDate(today.getMonth() + 1)}-${padDate(today.getDate())}`
            const MAX_VISIBLE = 3

            return (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 transition-colors ${dayEvents.length > 0 ? 'hover:bg-gray-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-[#9966CB] text-white' : 'text-gray-500'
                    }`}>
                      {day}
                    </div>
                    {dayEvents.slice(0, MAX_VISIBLE).map(e => (
                      <EventPill key={e.id} event={e} onClick={() => setModal({ type: 'event', event: e })} />
                    ))}
                    {dayEvents.length > MAX_VISIBLE && (
                      <button
                        onClick={() => setModal({ type: 'day', date: dateStr!, events: dayEvents })}
                        className="text-[10px] font-semibold text-[#9966CB] pl-1 hover:underline"
                      >
                        +{dayEvents.length - MAX_VISIBLE} more
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === 'event' && (
        <EventDetailModal
          event={modal.event}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'day' && (
        <DayModal
          date={modal.date}
          dayEvents={modal.events}
          onClose={() => setModal(null)}
          onSelectEvent={e => setModal({ type: 'event', event: e })}
        />
      )}
    </div>
  )
}
