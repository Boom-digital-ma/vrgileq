'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    setIsSearching(true)
    if (query.trim()) {
      router.push(`/auctions?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/auctions')
    }
    // Simple timeout to reset loader if navigation is fast
    setTimeout(() => setIsSearching(false), 800)
  }

  return (
    <form 
      onSubmit={handleSearch}
      className="flex items-center bg-white rounded-2xl p-1.5 border border-zinc-200 shadow-xl shadow-secondary/5 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300"
    >
      <div className="flex flex-1 items-center px-4">
        <Search className="mr-3 h-5 w-5 text-zinc-400" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items, models, or manufacturers..." 
          className="w-full py-3 text-sm md:text-base font-medium outline-none text-secondary placeholder:text-zinc-300 bg-transparent"
        />
      </div>
      <button 
        type="submit"
        disabled={isSearching}
        className="bg-secondary text-white px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-secondary/10"
      >
        {isSearching ? <Loader2 size={14} className="animate-spin" /> : "Search"}
      </button>
    </form>
  )
}
