/**
 * Date utility functions
 */

/**
 * Formats a date to ISO string format (YYYY-MM-DD)
 *
 * @param date - The date to format
 * @returns Formatted date string in ISO format
 *
 * @example
 * ```typescript
 * formatDateToISO(new Date('2024-01-15')) // "2024-01-15"
 * ```
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a date according to the specified format
 *
 * @param date - The date to format
 * @param format - The desired format ('short', 'long', or 'iso')
 * @returns The formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date(), 'short') // "1/15/2024"
 * formatDate(new Date(), 'long')  // "January 15, 2024"
 * formatDate(new Date(), 'iso')   // "2024-01-15T00:00:00.000Z"
 * ```
 */
export function formatDate(
  date: Date,
  format: 'short' | 'long' | 'iso' = 'short'
): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString()
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'iso':
      return date.toISOString()
  }
}

/**
 * Returns a human-readable relative time string
 *
 * @param date - The date to format
 * @returns Relative time string (e.g., "2 hours ago", "just now")
 *
 * @example
 * ```typescript
 * timeAgo(new Date(Date.now() - 3600000)) // "1 hour ago"
 * ```
 */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

/**
 * Adds days to a date
 *
 * @param date - The base date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 *
 * @example
 * ```typescript
 * addDays(new Date('2024-01-15'), 7) // Date for 2024-01-22
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Checks if two dates are on the same day
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same day
 *
 * @example
 * ```typescript
 * isSameDay(new Date('2024-01-15'), new Date('2024-01-15')) // true
 * ```
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

