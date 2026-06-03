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

// ── Event detail modal ────────────────────────────────────────────────────────

function EventDetailModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const colors = SPORT_COLORS[event.sport] ?? { bg: '#f3f4f6', text: '#374151' }

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
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, width: 'min(440px, 92vw)',
          padding: '28px 28px 24px', position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 12, right: 14, background: 'rgba(0,0,0,0.07)',
            border: 'none', borderRadius: '50%', width: 28, height: 28,
            cursor: 'pointer', fontSize: 14, color: '#555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 999, marginBottom: 14,
          background: colors.bg, color: colors.text,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {event.sport}
        </span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 16 }}>
          {event.title}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {[
            { icon: '📅', label: formatFullDate(event.date) },
            { icon: '🕐', label: `${event.time} ET` },
            { icon: '📍', label: `${event.venue} · ${event.city}, ${event.state}` },
          ].map(({ icon, label }) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 15, lineHeight: '20px', flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 13, color: '#444', lineHeight: '20px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Ticket CTAs */}
        {event.markets.length > 0 && (
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(() => {
              const priceValues = event.markets.map(m => m.minPrice).filter(p => p > 0)
              const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : null
              const hasComparablePrices = priceValues.length >= 2
              const MARKET_TEXT: Record<string, string> = {
                Ticketmaster: '#1d4ed8',
                SeatGeek: '#c2410c',
                StubHub: '#be123c',
                'Vivid Seats': '#7e22ce',
              }
              return event.markets.map(m => {
                const hasPrice = m.minPrice > 0
                const isBest = hasComparablePrices && hasPrice && m.minPrice === lowestPrice
                return (
                  <a
                    key={m.market}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 12, textDecoration: 'none',
                      border: `1px solid ${isBest ? '#bbf7d0' : '#e5e7eb'}`,
                      background: isBest ? '#f0fdf4' : '#f9fafb',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: MARKET_TEXT[m.market] ?? '#374151' }}>
                      {m.market}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isBest && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Best price
                        </span>
                      )}
                      <span style={{ fontSize: 13, fontWeight: 700, color: isBest ? '#15803d' : '#374151' }}>
                        {hasPrice ? `$${m.minPrice}` : 'See tickets'}
                      </span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>→</span>
                    </div>
                  </a>
                )
              })
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Calendar pill ─────────────────────────────────────────────────────────────

function EventPill({ event, onClick }: { event: Event; onClick: () => void }) {
  const colors = SPORT_COLORS[event.sport] ?? { bg: '#f3f4f6', text: '#374151' }
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 mb-0.5 min-w-0 w-full text-left hover:opacity-75 transition-opacity"
      style={{ background: colors.bg }}
    >
      <span className="text-[9px] font-bold shrink-0 uppercase tracking-wide" style={{ color: colors.text }}>
        {event.sport}
      </span>
      <span className="text-[10px] text-gray-700 truncate">{event.title}</span>
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CalendarClient({ events }: { events: Event[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalEvent, setModalEvent] = useState<Event | null>(null)

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return map
  }, [events])

  const cells = useMemo(() => getCalendarCells(year, month), [year, month])
  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : []

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
    setSelectedDate(null)
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

      {/* ── Events panel — shown above the grid when a day is selected ── */}
      {selectedDate && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">
            {formatFullDate(selectedDate)}
            <button onClick={() => setSelectedDate(null)} className="ml-3 text-xs font-medium text-gray-400 hover:text-gray-600">clear</button>
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No events on this day.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedEvents.map(e => {
                const colors = SPORT_COLORS[e.sport] ?? { bg: '#f3f4f6', text: '#374151' }
                return (
                  <button
                    key={e.id}
                    onClick={() => setModalEvent(e)}
                    className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-left hover:border-[#9966CB] transition-colors shadow-sm"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: colors.bg, color: colors.text }}>
                      {e.sport}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 flex-1 truncate">{e.title}</span>
                    <span className="text-xs text-gray-400 font-bold shrink-0">{e.time} ET</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Instruction header */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">
        Select a day to see the full women&apos;s sports schedule
      </p>

      {/* ── Desktop: 7-column calendar grid (hidden on mobile) ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
            const isSelected = dateStr === selectedDate
            const MAX_VISIBLE = 3
            return (
              <div
                key={i}
                onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
                className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 transition-colors ${day ? 'cursor-pointer' : ''} ${isSelected ? 'bg-violet-50' : dayEvents.length > 0 ? 'hover:bg-gray-50' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#9966CB] text-white' : 'text-gray-500'}`}>
                      {day}
                    </div>
                    {dayEvents.slice(0, MAX_VISIBLE).map(e => (
                      <EventPill key={e.id} event={e} onClick={() => setModalEvent(e)} />
                    ))}
                    {dayEvents.length > MAX_VISIBLE && (
                      <button
                        onClick={ev => { ev.stopPropagation(); setSelectedDate(dateStr) }}
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

      {/* ── Mobile: date-grouped list (shown only on mobile) ── */}
      <div className="sm:hidden flex flex-col gap-4">
        {(() => {
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const todayStr = `${today.getFullYear()}-${padDate(today.getMonth() + 1)}-${padDate(today.getDate())}`
          const groups: { dateStr: string; day: number; events: Event[] }[] = []
          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${padDate(month + 1)}-${padDate(d)}`
            const dayEvents = eventsByDate.get(dateStr) ?? []
            if (dayEvents.length > 0) groups.push({ dateStr, day: d, events: dayEvents })
          }
          if (groups.length === 0) {
            return <p className="text-sm text-gray-400 text-center py-8">No events this month.</p>
          }
          return groups.map(({ dateStr, day, events: dayEvents }) => {
            const isToday = dateStr === todayStr
            const label = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            })
            return (
              <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Date header */}
                <div className={`px-4 py-2.5 flex items-center gap-2 border-b border-gray-100 ${isToday ? 'bg-[#9966CB]' : 'bg-gray-50'}`}>
                  <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-700'}`}>{label}</span>
                  {isToday && <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide">Today</span>}
                </div>
                {/* Event rows */}
                <div className="flex flex-col divide-y divide-gray-100">
                  {dayEvents.map(e => {
                    const colors = SPORT_COLORS[e.sport] ?? { bg: '#f3f4f6', text: '#374151' }
                    return (
                      <button
                        key={e.id}
                        onClick={() => setModalEvent(e)}
                        className="flex items-center gap-3 px-4 py-3 text-left w-full hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                          style={{ background: colors.bg, color: colors.text }}>
                          {e.sport}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">{e.title}</span>
                        <span className="text-xs font-bold text-gray-400 shrink-0 whitespace-nowrap">{e.time} ET</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        })()}
      </div>

      {/* Event detail modal */}
      {modalEvent && (
        <EventDetailModal event={modalEvent} onClose={() => setModalEvent(null)} />
      )}
    </div>
  )
}
