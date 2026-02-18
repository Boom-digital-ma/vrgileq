'use client'

import { useTable } from "@refinedev/core"
import { cn } from "@/lib/utils"
import { Loader2, Truck, Calendar, Clock, CheckCircle2, Search, ExternalLink } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { useState } from "react"
import { markAsCollected } from "@/app/actions/sales"
import { toast } from "sonner"
import Link from "next/link"

export const LogisticsList = () => {
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  const result = useTable({
    resource: "sales",
    meta: { 
      select: "*, auction:auctions(title, lot_number), winner:profiles(full_name, phone), pickup_slot:pickup_slots(*)" 
    },
    filters: {
        permanent: [
            { field: "pickup_slot_id", operator: "null", value: false } // Only those with an appointment
        ]
    },
    sorters: {
        initial: [{ field: "pickup_slot_id", order: "asc" }] // We really want to sort by pickup_slot.start_at but Refine needs a direct field
    },
    pagination: { pageSize: 50 }
  })

  const tableQuery = (result as any).tableQuery;
  const sales = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  // Sort manually because Refine nested sort is tricky
  const sortedSales = [...sales].sort((a: any, b: any) => {
    if (!a.pickup_slot || !b.pickup_slot) return 0
    return new Date(a.pickup_slot.start_at).getTime() - new Date(b.pickup_slot.start_at).getTime()
  })

  const handleCollected = async (id: string) => {
    if (!confirm("Confirm this lot has left the premises?")) return
    setProcessingId(id)
    const res = await markAsCollected(id)
    if (res.success) {
        toast.success("Lot marked as collected")
        tableQuery.refetch()
    } else {
        toast.error(res.error)
    }
    setProcessingId(null)
  }

  if (isLoading) {
    return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Pickup Schedule...</p>
        </div>
    )
  }

  return (
    <div className="space-y-8 text-zinc-900">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Logistics Dashboard</h1>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Removal Management & Gate Control</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 p-6 rounded-[32px] shadow-sm italic">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Today's Appointments</p>
            <p className="text-3xl font-black text-zinc-900">{sortedSales.filter((s: any) => isToday(new Date(s.pickup_slot?.start_at))).length}</p>
        </div>
        <div className="bg-white border border-zinc-200 p-6 rounded-[32px] shadow-sm italic">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Tomorrow</p>
            <p className="text-3xl font-black text-zinc-900">{sortedSales.filter((s: any) => isTomorrow(new Date(s.pickup_slot?.start_at))).length}</p>
        </div>
        <div className="bg-prussian-blue p-6 rounded-[32px] shadow-xl shadow-prussian-blue/20 text-white italic">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Awaiting Collection</p>
            <p className="text-3xl font-black text-white">{sortedSales.filter((s: any) => !s.collected_at).length}</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[32px] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/50 text-[10px] uppercase tracking-widest italic font-sans">
              <th className="px-8 py-5">Time Slot</th>
              <th className="px-8 py-5">Customer / Contact</th>
              <th className="px-8 py-5">Asset Detail</th>
              <th className="px-8 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sortedSales.map((sale: any) => {
              const isCollected = !!sale.collected_at;
              const slotDate = new Date(sale.pickup_slot?.start_at);
              
              return (
                <tr key={sale.id} className={cn(
                    "hover:bg-zinc-50/50 transition-colors group",
                    isCollected && "opacity-60"
                )}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-sm font-black italic",
                            isToday(slotDate) ? "text-primary" : "text-zinc-900"
                        )}>
                            {format(slotDate, 'hh:mm a')}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {format(slotDate, 'MMM dd, yyyy')}
                        </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{sale.winner?.full_name}</span>
                        <span className="text-xs text-zinc-400 font-medium">{sale.winner?.phone || 'No phone'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black italic text-zinc-400">#{sale.auction?.lot_number}</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 line-clamp-1">{sale.auction?.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-3">
                        {isCollected ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest italic">
                                <CheckCircle2 size={14} /> Collected
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleCollected(sale.id)}
                                disabled={processingId === sale.id}
                                className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                            >
                                {processingId === sale.id ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />} Mark Collected
                            </button>
                        )}
                        <Link href={`/admin/sales/${sale.id}`} className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors">
                            <ExternalLink size={18} />
                        </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {sortedSales.length === 0 && (
                <tr>
                    <td colSpan={4} className="py-24 text-center">
                        <p className="text-zinc-300 italic font-medium">No pickup appointments scheduled for the upcoming period.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
