'use client'

import { useShow, useNavigation } from "@refinedev/core"
import { ArrowLeft, User, Package, Calendar, Clock, CreditCard, CheckCircle2, XCircle, Printer, Truck, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { updateSaleStatus } from "@/app/actions/sales"
import { toast } from "sonner"
import { useState } from "react"
import Link from "next/link"

export const SaleShow = () => {
  const { id } = useParams()
  const { list } = useNavigation()
  const [loading, setLoading] = useState(false)

  const result = useShow({
    resource: "sales",
    id: id as string,
    meta: {
      select: "*, auction:auctions(*), winner:profiles(*), event:auction_events(*), pickup_slot:pickup_slots(*)"
    }
  })

  const query = (result as any).query;
  const sale = query?.data?.data
  const isLoading = query?.isLoading

  const handleStatusUpdate = async (newStatus: any) => {
    setLoading(true)
    const res = await updateSaleStatus(id as string, newStatus)
    if (res.success) toast.success(`Sale marked as ${newStatus}`)
    else toast.error(res.error)
    query?.refetch()
    setLoading(false)
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
                    Finalized on {format(new Date(sale.created_at), 'MMMM dd, yyyy')}
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
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Asset Information</h3>
                </div>
                <div className="p-8 flex gap-8 items-start">
                    <div className="h-24 w-24 rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
                        {sale.auction.image_url ? (
                            <img src={sale.auction.image_url} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-300"><Package size={32} /></div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-xl font-bold text-zinc-900">{sale.auction.title}</h4>
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Lot #{sale.auction.lot_number || '---'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-zinc-900 italic font-mono">${Number(sale.hammer_price).toLocaleString()}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Hammer Price</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pickup Info */}
            <section className={cn(
                "border rounded-[32px] overflow-hidden shadow-sm",
                sale.pickup_slot ? "bg-emerald-50/30 border-emerald-100" : "bg-white border-zinc-200"
            )}>
                <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
                    <Truck className={sale.pickup_slot ? "text-emerald-500" : "text-zinc-400"} size={18} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Logistics & Removal</h3>
                </div>
                <div className="p-8">
                    {sale.pickup_slot ? (
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-zinc-900">
                                        {sale.pickup_slot?.start_at ? format(new Date(sale.pickup_slot.start_at), 'EEEE, MMMM dd') : 'Invalid Date'}
                                    </p>
                                    <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                                        <Clock size={14} /> 
                                        {sale.pickup_slot?.start_at ? format(new Date(sale.pickup_slot.start_at), 'hh:mm a') : '--:--'} - 
                                        {sale.pickup_slot?.end_at ? format(new Date(sale.pickup_slot.end_at), 'hh:mm a') : '--:--'}
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href={`/gate-pass/${sale.id}`}
                                target="_blank"
                                className="bg-white border border-emerald-200 text-emerald-600 px-6 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors"
                            >
                                Print Gate Pass
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-zinc-400 text-sm italic">No pickup appointment scheduled yet.</p>
                        </div>
                    )}
                </div>
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
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-amber-100 text-amber-600 text-xs font-bold hover:bg-amber-50 transition-all"
                        >
                            Issue Full Refund
                            <CreditCard size={16} />
                        </button>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
  )
}
