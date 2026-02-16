'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (query.trim()) {
      router.push(`/auctions?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/auctions')
    }
  }

  return (
    <form 
      onSubmit={handleSearch}
      className="flex border-4 border-primary bg-white shadow-[12px_12px_0px_0px_rgba(11,43,83,0.2)]"
    >
      <div className="flex flex-1 items-center px-6">
        <Search className="mr-4 h-5 w-5 text-primary" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product, model, or auction name..." 
          className="w-full py-6 text-lg font-bold outline-none text-neutral placeholder:text-neutral/30 font-sans"
        />
      </div>
      <button 
        type="submit"
        className="bg-primary px-10 text-xs font-black uppercase tracking-widest text-white hover:bg-secondary transition-colors font-sans"
      >
        Search
      </button>
    </form>
  )
}
