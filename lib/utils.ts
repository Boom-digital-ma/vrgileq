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
