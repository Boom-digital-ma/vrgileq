'use client'

import { useShow, useNavigation } from "@refinedev/core"
import { ArrowLeft, User, Package, Calendar, Clock, CreditCard, CheckCircle2, XCircle, Printer, Truck, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { cn, formatEventDate } from "@/lib/utils"
import { updateSaleStatus, refundSale } from "@/app/actions/sales"
import { toast } from "sonner"
import { useState } from "react"
import Link from "next/link"
import PickupScheduler from "@/components/auction/PickupScheduler"
import { useList } from "@refinedev/core"

export const SaleShow = () => {
  const { id } = useParams()
  const { list } = useNavigation()
  const [loading, setLoading] = useState(false)
  const [refunding, setRefunding] = useState(false)

  const result = useShow({
    resource: "sales",
    id: id as string,
    meta: {
      select: "*, sale_items(*, auction:auctions(*)), winner:profiles(*), event:auction_events(*), pickup_slot:pickup_slots(*)"
    }
  })

  const query = (result as any).query;
  const sale = query?.data?.data
  const isLoading = query?.isLoading

  // Fetch available slots if sale is loaded
  const slotsResult = useList({
    resource: "pickup_slots_with_counts",
    filters: [
        { field: "event_id", operator: "eq", value: sale?.event_id }
    ],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!sale?.event_id }
  })
  const slots = (slotsResult as any).query?.data?.data || []

  const handleStatusUpdate = async (newStatus: any) => {
    setLoading(true)
    const res = await updateSaleStatus(id as string, newStatus)
    if (res.success) toast.success(`Sale marked as ${newStatus}`)
    else toast.error(res.error)
    query?.refetch()
    setLoading(false)
  }

  const handleRefund = async () => {
    if (!confirm("CRITICAL: This will return the full amount to the customer via Stripe. Proceed?")) return
    setRefunding(true)
    const res = await refundSale(id as string)
    if (res.success) {
        toast.success("Full refund issued successfully")
        query?.refetch()
    } else {
        toast.error("Refund failed: " + res.error)
    }
    setRefunding(false)
  }

  if (isLoading) return <div className="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Transaction Record...</div>
  if (!sale) return <div className="p-20 text-center">Sale not found</div>

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => list("sales")} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                    {sale.invoice_number}
                    <span className={cn(
                        "text-[10px] not-italic px-3 py-1 rounded-full border uppercase tracking-widest",
                        sale.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        sale.status === 'cancelled' ? "bg-rose-50 text-rose-600 border-rose-200" :
                        "bg-amber-50 text-amber-600 border-amber-200"
                    )}>
                        {sale.status}
                    </span>
                </h1>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest italic">
                    Finalized on {formatEventDate(sale.created_at)}
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <Link 
              href={`/invoices/${sale.id}`} 
              target="_blank"
              className="bg-white text-zinc-900 border border-zinc-200 px-6 py-3 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2"
            >
                <Printer size={16} className="text-zinc-400" /> View Invoice
            </Link>
            
            {sale.status !== 'paid' && (
                <button 
                  disabled={loading}
                  onClick={() => handleStatusUpdate('paid')}
                  className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Mark as Paid
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Customer & Lot */}
        <div className="lg:col-span-2 space-y-8">
            {/* Customer Info */}
            <section className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-3">
                    <User className="text-zinc-400" size={18} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Winner Details</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-lg font-bold text-zinc-900">{sale.winner.full_name}</p>
                        <p className="text-sm text-zinc-500">{sale.winner.email}</p>
                        <p className="text-sm text-zinc-500 mt-1">{sale.winner.phone || 'No phone provided'}</p>
                    </div>
                    <div className="text-sm text-zinc-500 font-medium">
                        <p className="uppercase text-[9px] tracking-widest text-zinc-300 mb-2 font-black">Dispatch Address</p>
                        <p>{sale.winner.address_line}</p>
                        <p>{sale.winner.city}, {sale.winner.state} {sale.winner.zip_code}</p>
                        <p>{sale.winner.country}</p>
                    </div>
                </div>
            </section>

            {/* Lot Info */}
            <section className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-3">
                    <Package className="text-zinc-400" size={18} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Included Assets</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <th className="px-8 py-4">Lot Detail</th>
                                <th className="px-8 py-4 text-center">Lot #</th>
                                <th className="px-8 py-4 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {sale.sale_items?.map((item: any) => (
                                <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
                                                {item.auction?.image_url && <img src={item.auction.image_url} className="h-full w-full object-cover" />}
                                            </div>
                                            <p className="font-bold text-secondary uppercase leading-tight">{item.auction?.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center font-black text-secondary italic">#{item.auction?.lot_number || '---'}</td>
                                    <td className="px-8 py-6 text-right font-bold text-secondary tabular-nums italic">${Number(item.hammer_price).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pickup Info / Assignment */}
            <section>
                <PickupScheduler 
                    saleId={sale.id}
                    eventId={sale.event_id}
                    currentSlotId={sale.pickup_slot_id}
                    slots={slots}
                    isPaid={sale.status === 'paid'}
                    onSuccess={() => query?.refetch()}
                />
            </section>
        </div>

        {/* Right Col: Financials */}
        <div className="space-y-8">
            <section className="bg-zinc-900 rounded-[32px] p-8 text-white shadow-2xl shadow-zinc-200 relative overflow-hidden italic border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8">Financial Summary</h3>
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hammer Price</span>
                        <span className="font-bold tabular-nums text-white text-base">${Number(sale.hammer_price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Buyer's Premium ({sale.buyers_premium_rate}%)</span>
                        <span className="font-bold tabular-nums text-white text-base">${Number(sale.buyers_premium_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tax ({sale.tax_rate}%)</span>
                        <span className="font-bold tabular-nums text-white text-base">${Number(sale.tax_amount).toLocaleString()}</span>
                    </div>
                    <div className="pt-6 border-t border-white/10 mt-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Total Collected</span>
                            <span className="text-4xl font-black tabular-nums tracking-tighter text-white">${Number(sale.total_amount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/10 blur-3xl rounded-full"></div>
            </section>

            {/* Internal Actions */}
            <section className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Internal Controls</h3>
                <div className="space-y-3">
                    {sale.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleStatusUpdate('cancelled')}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-rose-100 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-all"
                        >
                            Cancel Transaction
                            <XCircle size={16} />
                        </button>
                    )}
                    {sale.status === 'paid' && (
                        <button 
                          disabled={refunding}
                          onClick={handleRefund}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-amber-100 text-amber-600 text-xs font-bold hover:bg-amber-50 transition-all disabled:opacity-50"
                        >
                            {refunding ? "Processing Refund..." : "Issue Full Refund"}
                            {refunding ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                        </button>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
  )
}
