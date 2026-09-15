'use client'

import { useTable, useInvalidate } from "@refinedev/core"
import { cn, formatEventDate } from "@/lib/utils"
import { Search, Loader2, ArrowLeft, User, Clock, Trash2, Layers, CalendarDays, Package, Users, Ban, X } from "lucide-react"
import { useState, useMemo } from "react"
import { adminCancelBid } from "@/app/actions/bids"
import { toast } from "sonner"

type GroupMode = 'none' | 'event' | 'lot' | 'bidder'

export const BidList = () => {
  const invalidate = useInvalidate()
  const result = useTable({
    resource: "bids",
    meta: {
      select: "*, auctions(title, id, lot_number, event_id, auction_events(title)), profiles:user_id(full_name, email)"
    },
    pagination: { pageSize: 50 },
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

  const activePage = currentPage || current;
  const goToPage = setCurrentPage || setCurrent;

  const [searchQuery, setSearchQuery] = useState("")
  const [groupMode, setGroupMode] = useState<GroupMode>('none')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

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

  const handleCancelBid = async (bidId: string) => {
    setCancellingId(bidId)
    try {
      const result = await adminCancelBid(bidId)
      if (!result.success) throw new Error(result.error)
      toast.success("Bid cancelled successfully")
      invalidate({ resource: "bids", invalidates: ["list"] })
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel bid")
    } finally {
      setCancellingId(null)
      setConfirmId(null)
    }
  }

  // Group bids based on selected mode
  const groupedBids = useMemo(() => {
    if (groupMode === 'none') return null

    const groups: Record<string, { label: string; sublabel?: string; bids: any[]; totalAmount: number; count: number }> = {}

    for (const bid of bids) {
      let key = ''
      let label = ''
      let sublabel = ''

      if (groupMode === 'event') {
        key = bid.auctions?.event_id || 'no-event'
        label = bid.auctions?.auction_events?.title || 'No Event'
      } else if (groupMode === 'lot') {
        key = bid.auction_id || 'unknown'
        const lotNum = bid.auctions?.lot_number
        label = bid.auctions?.title || 'Unknown Lot'
        sublabel = lotNum ? `Lot #${lotNum}` : ''
      } else if (groupMode === 'bidder') {
        key = bid.user_id || 'unknown'
        label = bid.profiles?.full_name || 'Anonymous'
        sublabel = bid.profiles?.email || ''
      }

      if (!groups[key]) {
        groups[key] = { label, sublabel, bids: [], totalAmount: 0, count: 0 }
      }
      groups[key].bids.push(bid)
      groups[key].totalAmount += Number(bid.amount) || 0
      groups[key].count += 1
    }

    return Object.entries(groups).sort((a, b) => b[1].totalAmount - a[1].totalAmount)
  }, [bids, groupMode])

  if (isLoading) {
    return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading bids...</p>
        </div>
    )
  }

  const groupModes: { value: GroupMode; label: string; icon: any }[] = [
    { value: 'none', label: 'Flat', icon: Layers },
    { value: 'event', label: 'Event', icon: CalendarDays },
    { value: 'lot', label: 'Lot', icon: Package },
    { value: 'bidder', label: 'Bidder', icon: Users },
  ]

  return (
    <div className="space-y-6 text-zinc-900 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Bid Registry</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px] italic">{totalBidCount.toLocaleString()} total bids</p>
        </div>

        {/* Status Quick Filters */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm w-fit">
            {['all', 'active', 'outbid', 'won', 'cancelled'].map((s) => {
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

      {/* Search + Group Mode Bar */}
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

        {/* Group Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-2xl border border-zinc-100 shrink-0">
            {groupModes.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    onClick={() => setGroupMode(value)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                        groupMode === value
                            ? "bg-secondary text-white shadow-sm"
                            : "text-zinc-400 hover:text-zinc-700"
                    )}
                >
                    <Icon size={13} />
                    {label}
                </button>
            ))}
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

      {/* Content: Grouped or Flat */}
      {groupMode === 'none' ? (
        <FlatTable bids={bids} confirmId={confirmId} cancellingId={cancellingId} onConfirm={setConfirmId} onCancel={handleCancelBid} />
      ) : (
        <div className="space-y-6">
          {groupedBids?.map(([key, group]) => (
            <div key={key} className="bg-white border border-zinc-200 rounded-[32px] shadow-sm overflow-hidden">
              {/* Group Header */}
              <div className="flex items-center justify-between px-6 py-5 bg-zinc-50/80 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                    {groupMode === 'event' && <CalendarDays size={16} className="text-secondary" />}
                    {groupMode === 'lot' && <Package size={16} className="text-secondary" />}
                    {groupMode === 'bidder' && <User size={16} className="text-secondary" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-tight text-secondary italic">{group.label}</h3>
                    {group.sublabel && <p className="text-[10px] font-medium text-zinc-400 italic">{group.sublabel}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Bids</p>
                    <p className="text-sm font-black text-secondary italic">{group.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Total</p>
                    <p className="text-sm font-black text-primary italic">${group.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
              {/* Group Rows */}
              <FlatTable bids={group.bids} hideColumn={groupMode} confirmId={confirmId} cancellingId={cancellingId} onConfirm={setConfirmId} onCancel={handleCancelBid} />
            </div>
          ))}
          {groupedBids?.length === 0 && (
            <div className="bg-white border border-zinc-200 rounded-[32px] p-16 text-center">
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest italic">No bids found</p>
            </div>
          )}
        </div>
      )}

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

function FlatTable({ bids, hideColumn, confirmId, cancellingId, onConfirm, onCancel }: {
  bids: any[];
  hideColumn?: GroupMode;
  confirmId: string | null;
  cancellingId: string | null;
  onConfirm: (id: string | null) => void;
  onCancel: (id: string) => void;
}) {
  const canCancel = (status: string) => status === 'active' || status === 'outbid'

  return (
    <div className="text-sm font-sans overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/50 text-[10px] uppercase tracking-widest font-sans italic">
            {hideColumn !== 'lot' && <th className="px-6 py-4">Lot / Auction</th>}
            {hideColumn !== 'event' && <th className="px-6 py-4">Event</th>}
            {hideColumn !== 'bidder' && <th className="px-6 py-4">Bidder</th>}
            <th className="px-6 py-4">Bid / Proxy</th>
            <th className="px-6 py-4">Timestamp</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 font-sans">
          {bids.map((bid: any) => {
            const isConfirming = confirmId === bid.id
            const isCancelling = cancellingId === bid.id

            return (
              <tr key={bid.id} className={cn(
                "transition-colors group",
                bid.status === 'cancelled' ? "opacity-40 bg-zinc-50/50" : "hover:bg-zinc-50/50"
              )}>
                {hideColumn !== 'lot' && (
                  <td className="px-6 py-4">
                      <div className="flex flex-col">
                          {bid.auctions?.lot_number && (
                              <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">Lot #{bid.auctions.lot_number}</span>
                          )}
                          <span className="font-bold text-zinc-900 uppercase tracking-tight text-xs leading-tight line-clamp-1">
                              {bid.auctions?.title || 'Unknown'}
                          </span>
                      </div>
                  </td>
                )}
                {hideColumn !== 'event' && (
                  <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight line-clamp-1">
                          {bid.auctions?.auction_events?.title || '—'}
                      </span>
                  </td>
                )}
                {hideColumn !== 'bidder' && (
                  <td className="px-6 py-4">
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
                )}
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-black tabular-nums text-sm",
                              bid.status === 'cancelled' ? "text-zinc-400 line-through" : "text-secondary"
                            )}>${Number(bid.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide border italic",
                                bid.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                bid.status === 'outbid' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                bid.status === 'cancelled' ? "bg-zinc-100 text-zinc-400 border-zinc-200" :
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
                <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-[11px] tabular-nums">
                        <Clock size={12} className="text-zinc-300" />
                        {formatEventDate(bid.created_at)}
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {canCancel(bid.status) && (
                    isConfirming ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onCancel(bid.id)}
                          disabled={isCancelling}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-rose-600 transition-all disabled:opacity-50"
                        >
                          {isCancelling ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                          Confirm
                        </button>
                        <button
                          onClick={() => onConfirm(null)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onConfirm(bid.id)}
                        className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Cancel this bid"
                      >
                        <Ban size={16} />
                      </button>
                    )
                  )}
                </td>
              </tr>
            )
          })}
          {bids.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest italic">
                No bids found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
