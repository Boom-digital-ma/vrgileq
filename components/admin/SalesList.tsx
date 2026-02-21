'use client'

import { useTable } from "@refinedev/core"
import { cn, formatEventDateShort } from "@/lib/utils"
import { Loader2, FileText, Eye, Package } from "lucide-react"
import Link from "next/link"

export const SalesList = () => {
  const result = useTable({
    resource: "sales",
    meta: { 
      select: "*, auction:auctions(title, image_url), winner:profiles(full_name), event:auction_events(title)" 
    },
    pagination: { pageSize: 20 },
    sorters: {
      initial: [{ field: "created_at", order: "desc" }]
    }
  })

  const tableQuery = (result as any).tableQuery;
  const sales = tableQuery?.data?.data || []
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
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Sales Data...</p>
        </div>
    )
  }

  return (
    <div className="space-y-6 text-zinc-900">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Sales & Invoicing</h1>
        <p className="text-sm text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Manage finalized transactions and lot payouts</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm w-fit">
        {['all', 'pending', 'paid', 'cancelled'].map((s) => (
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
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Invoice</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest w-16">Item</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Customer / Lot</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Event</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-right">Total</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sales.map((sale: any) => (
              <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{sale.invoice_number}</span>
                    <span className="text-[10px] text-zinc-400 font-mono italic">
                      {formatEventDateShort(sale.created_at)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                    {sale.auction?.image_url ? (
                      <img src={sale.auction.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-300">
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{sale.winner?.full_name || 'Anonymous Bidder'}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">{sale.auction?.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase border border-zinc-200">
                    {sale.event?.title || 'General Sale'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-zinc-900 tabular-nums">${Number(sale.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <span className={cn(
                          "text-[9px] font-black uppercase px-1.5 py-0.5 rounded border",
                          sale.status === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          sale.status === 'cancelled' ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                      )}>{sale.status}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/invoices/${sale.id}`}
                      target="_blank"
                      className="p-2 text-zinc-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors group"
                      title="View Invoice"
                    >
                      <FileText size={18} className="group-hover:scale-110 transition-transform" />
                    </Link>
                    <Link 
                      href={`/admin/sales/${sale.id}`}
                      className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Details"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sales.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/30">
          <p className="text-zinc-400 font-medium italic">No sales found in the registry.</p>
        </div>
      )}
    </div>
  )
}
