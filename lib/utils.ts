import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatEventDate(date: string | Date | number) {
  if (!date) return ""
  const d = new Date(date)
  const datePart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).format(d)
  
  const timePart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d)

  return `${datePart} @ ${timePart}`
}

export function formatEventDateShort(date: string | Date | number) {
  if (!date) return ""
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: '2-digit'
  }).format(new Date(date))
}

export function formatEventTime(date: string | Date | number) {
  if (!date) return ""
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date))
}

/**
 * Formats a date for <input type="datetime-local"> specifically in New York Time
 */
export function formatDateForInput(date: string | Date | number | null | undefined) {
  if (!date) return ""
  const d = new Date(date)
  
  // Create a formatter for New York
  const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(d)
  const getPart = (type: string) => parts.find(p => p.type === type)?.value
  
  // Format: YYYY-MM-DDTHH:mm
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url: string, { width = 800, quality = 80 }: { width?: number, quality?: number } = {}) {
  if (!url) return "/images/placeholder.jpg"
  
  // Only apply optimization to Supabase Storage URLs
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Check if URL already has params
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}width=${width}&quality=${quality}&resize=contain`
  }
  
  return url
}

/**
 * Calculates the next required increment based on current price
 */
export function calculateNextIncrement(price: number): number {
  const p = Number(price) || 0;
  if (p < 10) return 1;
  if (p < 25) return 5;
  if (p < 100) return 10;
  if (p < 250) return 20;
  if (p < 500) return 25;
  if (p < 1000) return 35;
  if (p < 2500) return 50;
  if (p < 5000) return 150;
  return 500;
}
