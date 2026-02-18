import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
