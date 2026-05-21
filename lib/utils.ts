export const MS_72H = 72 * 60 * 60 * 1000

export function parseEventStart(date: string, time: string): Date {
  const base = new Date(date + 'T00:00:00')
  const match = time.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
  if (!match) return base
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const period = match[3].toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  base.setHours(h, m, 0, 0)
  return base
}

export function isWithin72Hours(date: string, time: string): boolean {
  const ms = parseEventStart(date, time).getTime() - Date.now()
  return ms > 0 && ms <= MS_72H
}
