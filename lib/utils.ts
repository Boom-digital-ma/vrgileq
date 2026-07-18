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
  if (p < 1) return 0.10; // Fallback if below $1
  if (p < 3) return 0.50; // New rule: $1 – $2.99 is $0.50 increment
  if (p < 10) return 1.00; // New rule: $3 – $9.99 is $1.00 increment
  if (p < 25) return 2.00;
  if (p < 50) return 2.50;
  if (p < 100) return 5.00;
  if (p < 150) return 7.50;
  if (p < 200) return 10.00;
  if (p < 500) return 15.00;
  if (p < 550) return 25.00;
  if (p < 600) return 30.00;
  if (p < 2000) return 50.00;     // Merges $600-$799.99 ($50) and $800-$1,999.99 ($50)
  if (p < 30000) return 100.00;    // Merges $2000-$9,999.99 ($100) and $10,000-$29,999.99 ($100)
  if (p < 40000) return 300.00;
  if (p < 50000) return 400.00;
  if (p < 100000) return 500.00;
  if (p < 150000) return 1000.00;
  if (p < 200000) return 1500.00;
  if (p < 250000) return 2000.00;
  if (p < 300000) return 2500.00;
  if (p < 350000) return 3000.00;
  return 3500.00;                 // Merges $350,000+ ($3500)
}
