/**
 * Calculate the next due date based on recurrence type.
 * recurrence: 'monthly' | 'quarterly' | 'yearly' | 'custom'
 * customDays: used when recurrence === 'custom'
 */
export function calcNextDueDate(from: Date, recurrence: string, customDays?: number | null): Date {
  const next = new Date(from)
  switch (recurrence) {
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
    case 'custom':
      next.setDate(next.getDate() + (customDays || 30))
      break
    case 'once':
      // no recurrence – keep same date
      break
    default:
      next.setMonth(next.getMonth() + 1)
  }
  return next
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export const RECURRENCE_LABELS: Record<string, string> = {
  monthly: 'Mesačne',
  quarterly: 'Štvrťročne',
  yearly: 'Ročne',
  custom: 'Vlastné (dni)',
  once: 'Jednorazovo',
}
