import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export function formatCurrency(value: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(value || 0)
  } catch {
    return `$${(value || 0).toFixed(2)}`
  }
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value || 0)
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value || 0).toFixed(digits)}%`
}

function toDate(input: string | Date | undefined | null): Date | null {
  if (!input) return null
  if (input instanceof Date) return isValid(input) ? input : null
  const parsed = parseISO(input)
  return isValid(parsed) ? parsed : null
}

export function formatDate(value: string | Date | undefined, pattern = 'MMM d, yyyy'): string {
  const date = toDate(value)
  if (!date) return '-'
  return format(date, pattern)
}

export function formatDateTime(value: string | Date | undefined): string {
  return formatDate(value, 'MMM d, yyyy h:mm a')
}

export function formatRelative(value: string | Date | undefined): string {
  const date = toDate(value)
  if (!date) return '-'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function useFormat() {
  return { formatCurrency, formatDate, formatDateTime, formatNumber, formatPercent, formatRelative }
}
