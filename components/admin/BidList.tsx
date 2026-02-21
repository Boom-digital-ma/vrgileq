'use client'

import { useTable } from "@refinedev/core"
import { cn, formatEventDate } from "@/lib/utils"
import { Search, Loader2 } from "lucide-react"

export const BidList = () => {
  const result = useTable({
    resource: "bids",
    meta: { select: "*, auctions(title)" },
    pagination: { pageSize: 20 }
  })

  const tableQuery = (result as any).tableQuery;
  const bids = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { setFilters, filters } = result

  const handleStatusFilter = (status: string) => {
    setFilters([
      { field: "status", operator: "eq", value: status === "all" ? undefined : status }
    ], "replace")
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
    <div className="space-y-6 text-zinc-900">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Bid Registry</h1>
        <p className="text-sm text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Comprehensive log of all platform transactions</p>
      </div>

      {/* Boutons de filtrage par statut */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm w-fit">
        {['all', 'won', 'outbid', 'active'].map((s) => (
            <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    (filters.find((f: any) => f.field === "status")?.value === s || (s === 'all' && !filters.find((f: any) => f.field === "status")?.value))
                    ? "bg-zinc-900 text-white shadow-md" 
                    : "bg-transparent text-zinc-400 hover:text-zinc-900"
                )}
            >
                {s}
            </button>
        ))}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 font-medium border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Auction Asset</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Amount</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {bids.map((bid: any) => (
              <tr key={bid.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 font-bold">{bid.auctions?.title || 'System Asset'}</td>
                <td className="px-6 py-4">
                    <span className="font-bold text-zinc-900 tabular-nums">${Number(bid.amount).toLocaleString()}</span>
                    <span className={cn(
                        "ml-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border",
                        bid.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        bid.status === 'outbid' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                    )}>{bid.status}</span>
                </td>
                <td className="px-6 py-4 text-right text-zinc-400 text-[11px] tabular-nums font-mono italic">
                    {formatEventDate(bid.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
