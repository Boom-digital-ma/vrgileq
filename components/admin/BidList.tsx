'use client'

import { useTable, useNavigation } from "@refinedev/core"
import { cn, formatEventDate } from "@/lib/utils"
import { Search, Loader2, ArrowLeft, User, Mail, Calendar, Filter, Trash2, Clock } from "lucide-react"
import { useState } from "react"

export const BidList = () => {
  const result = useTable({
    resource: "bids",
    meta: { 
      select: "*, auctions(title, id, lot_number, event_id, auction_events(title)), profiles:user_id(full_name, email)"
    },
    pagination: { pageSize: 10 },
    sorters: { initial: [{ field: "created_at", order: "desc" }] }
  })

  const tableQuery = (result as any).tableQuery;
  const bids = tableQuery?.data?.data || []
  const totalBidCount = tableQuery?.data?.total || 0
  const isLoading = tableQuery?.isLoading

  const { 
    current,
    setCurrent,
    currentPage,
    setCurrentPage,
    pageCount,
    setFilters,
    filters 
  } = result as any

  // Safety aliasing for Refine v5 inconsistencies
  const activePage = currentPage || current;
  const goToPage = setCurrentPage || setCurrent;

  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (val: string) => {
    setSearchQuery(val)
    setFilters([
      {
        operator: "or" as const,
        value: [
          { field: "auctions.title", operator: "contains", value: val },
          { field: "profiles.full_name", operator: "contains", value: val },
          { field: "profiles.email", operator: "contains", value: val },
        ]
      }
    ])
  }

  const handleStatusFilter = (status: string) => {
    setFilters([
      { field: "status", operator: "eq", value: status === "all" ? undefined : status }
    ], "merge")
  }

  if (isLoading) {
    return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing with Refine v5...</p>
        </div>
    )
  }

  return (
    <div className="space-y-6 text-zinc-900 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Bid Registry</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px] italic">{totalBidCount.toLocaleString()} total bids</p>
        </div>
        
        {/* Status Quick Filters */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm w-fit">
            {['all', 'active', 'outbid', 'won'].map((s) => {
                const isActive = (filters.find((f: any) => f.field === "status")?.value === s || (s === 'all' && !filters.find((f: any) => f.field === "status")?.value));
                return (
                    <button
                        key={s}
                        onClick={() => handleStatusFilter(s)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                            isActive
                                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                                : "bg-transparent text-zinc-400 hover:text-zinc-900"
                        )}
                    >
                        {s}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Search & Period Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-2xl px-4 h-12 w-full">
            <Search className="text-zinc-400 shrink-0" size={18} />
            <input 
                type="text" 
                placeholder="Search by Asset Title, Bidder Name or Email..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)} 
                className="flex-1 outline-none text-sm bg-transparent font-sans placeholder:text-zinc-400" 
            />
        </div>
        
        {(searchQuery || filters.some((f: any) => f.field === "status" && f.value)) && (
            <button 
                onClick={() => {
                    setSearchQuery("");
                    setFilters([]);
                }}
                className="h-12 w-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all shrink-0"
                title="Clear Filters"
            >
                <Trash2 size={18} />
            </button>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-[32px] shadow-sm overflow-hidden text-sm font-sans">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/50 text-[10px] uppercase tracking-widest font-sans italic">
              <th className="px-6 py-5">Lot / Auction</th>
              <th className="px-6 py-5">Event</th>
              <th className="px-6 py-5">Bidder</th>
              <th className="px-6 py-5">Bid / Proxy</th>
              <th className="px-6 py-5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-sans">
            {bids.map((bid: any) => (
              <tr key={bid.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-5">
                    <div className="flex flex-col">
                        {bid.auctions?.lot_number && (
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Lot #{bid.auctions.lot_number}</span>
                        )}
                        <span className="font-bold text-zinc-900 uppercase tracking-tight text-xs leading-tight line-clamp-1">
                            {bid.auctions?.title || 'Unknown'}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight line-clamp-1">
                        {bid.auctions?.auction_events?.title || '—'}
                    </span>
                </td>
                <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center border border-zinc-100">
                            <User size={14} className="text-zinc-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 text-xs uppercase italic">{bid.profiles?.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-zinc-400 font-medium lowercase italic">{bid.profiles?.email || '—'}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-secondary tabular-nums text-sm">${Number(bid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border italic",
                                bid.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                bid.status === 'outbid' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                "bg-blue-50 text-blue-700 border-blue-200"
                            )}>{bid.status}</span>
                        </div>
                        {bid.max_amount && Number(bid.max_amount) > Number(bid.amount) && (
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                                Proxy: ${Number(bid.max_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-zinc-900 font-bold text-[11px] tabular-nums">
                        <Clock size={12} className="text-zinc-300" />
                        {formatEventDate(bid.created_at)}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[24px] border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Registry Page</span>
                <span className="text-xs font-black italic">{activePage} / {pageCount}</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    disabled={activePage === 1}
                    onClick={() => goToPage(activePage - 1)}
                    className="p-2.5 border border-zinc-100 rounded-xl hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400"
                >
                    <ArrowLeft size={18} />
                </button>
                <button 
                    disabled={activePage === pageCount}
                    onClick={() => goToPage(activePage + 1)}
                    className="p-2.5 border border-zinc-100 rounded-xl hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400 rotate-180"
                >
                    <ArrowLeft size={18} />
                </button>
            </div>
        </div>
      )}
    </div>
  )
}
