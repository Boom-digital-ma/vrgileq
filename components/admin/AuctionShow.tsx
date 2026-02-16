'use client'

import React from "react"
import { useShow, useList, useNavigation } from "@refinedev/core"
import { ArrowLeft, Gavel, User, Clock, Package, BadgeCheck, ShieldAlert, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const AuctionShow = () => {
  const { list } = useNavigation()
  const result = useShow({
    resource: "auctions",
    meta: { select: "*, categories(name), auction_events(title)" }
  })
  const { data, isLoading } = (result as any).query || result
  const lot = data?.data

  // Fetch bids for this specific lot
  const bidsResult = useList({
    resource: "bids",
    filters: [{ field: "auction_id", operator: "eq", value: lot?.id }],
    queryOptions: { enabled: !!lot?.id },
    meta: { select: "*, profiles(full_name)" }
  })
  const bids = (bidsResult as any).query?.data?.data || []
  const isBidsLoading = (bidsResult as any).query?.isLoading

  if (isLoading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Asset Records...</p>
    </div>
  )

  return (
    <div className="space-y-8 text-zinc-900 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => list("auctions")} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{lot?.auction_events?.title || 'Standalone Asset'}</span>
                    <span className="text-[10px] text-zinc-300">•</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">LOT #{lot?.id?.slice(0,8)}</span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">{lot?.title}</h1>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <span className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border",
                lot?.status === 'live' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-50 text-zinc-400 border-zinc-100"
            )}>{lot?.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats Card */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-8 border-b border-zinc-50 pb-4">
                    <History size={18} className="text-zinc-400" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Complete Bidding History</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                                <th className="pb-4">Bidder Identity</th>
                                <th className="pb-4 text-center">Amount</th>
                                <th className="pb-4 text-center">Status</th>
                                <th className="pb-4 text-right">Time (EST)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 font-sans">
                            {bids.map((bid: any) => (
                                <tr key={bid.id} className="group">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 text-zinc-400">
                                                <User size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold uppercase tracking-tight text-zinc-900">{bid.profiles?.full_name || 'Verified Bidder'}</span>
                                                <span className="text-[9px] text-zinc-400 font-mono italic">ID: {bid.user_id.slice(0,8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="text-base font-black italic tabular-nums text-zinc-900">${Number(bid.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                            bid.status === 'won' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            bid.status === 'outbid' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>{bid.status}</span>
                                    </td>
                                    <td className="py-4 text-right text-zinc-400 text-[11px] tabular-nums font-mono italic">
                                        {new Date(bid.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                </tr>
                            ))}
                            {bids.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-zinc-300 font-bold uppercase tracking-widest text-[10px] italic">No activity recorded for this asset yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-6">
            <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Financial Summary</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <span className="text-[10px] text-white/40 font-bold uppercase">Current High Bid</span>
                            <span className="text-3xl font-black italic tabular-nums text-primary">${Number(lot?.current_price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Starting Price</span>
                            <span className="font-bold tabular-nums">${Number(lot?.start_price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Bid Count</span>
                            <span className="font-bold tabular-nums">{bids.length} Total</span>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/10 blur-3xl rounded-full"></div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Asset Specifications</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Package className="text-zinc-300" size={16} />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Category</span>
                            <span className="text-xs font-black uppercase italic text-zinc-900">{lot?.categories?.name || 'GENERIC'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="text-zinc-300" size={16} />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Last Activity</span>
                            <span className="text-xs font-black uppercase italic text-zinc-900">{bids.length > 0 ? new Date(bids[0].created_at).toLocaleDateString() : 'None'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

import { Loader2, History } from "lucide-react"
