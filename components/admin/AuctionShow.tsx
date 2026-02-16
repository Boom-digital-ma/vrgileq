'use client'

import React from "react"
import { useShow, useList, useNavigation } from "@refinedev/core"
import { ArrowLeft, Gavel, User, Clock, Package, BadgeCheck, ShieldAlert, DollarSign, History, Loader2, Info, LayoutGrid, Cpu, Factory } from "lucide-react"
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
    meta: { select: "*, profiles(full_name)" },
    sorters: [{ field: "created_at", order: "desc" }]
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
    <div className="max-w-7xl mx-auto space-y-8 text-zinc-900 font-sans py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-8">
        <div className="flex items-center gap-6">
            <button onClick={() => list("auctions")} className="p-4 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400 border border-zinc-100 shadow-sm bg-white">
                <ArrowLeft size={24} />
            </button>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic px-2 py-0.5 bg-primary/10 rounded">{lot?.auction_events?.title || 'Standalone Asset'}</span>
                    <span className="text-[10px] text-zinc-300">•</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">LOT #{lot?.lot_number || '---'}</span>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">{lot?.title}</h1>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <span className={cn(
                "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                lot?.status === 'live' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-50 text-zinc-400 border-zinc-100"
            )}>{lot?.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-10">
            
            {/* Asset Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-zinc-100 rounded-[32px] p-6 space-y-2">
                    <div className="bg-zinc-50 w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400"><Factory size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Manufacturer</span>
                    <span className="text-sm font-black uppercase italic text-zinc-900">{lot?.manufacturer || 'N/A'}</span>
                </div>
                <div className="bg-white border-2 border-zinc-100 rounded-[32px] p-6 space-y-2">
                    <div className="bg-zinc-50 w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400"><Cpu size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Model</span>
                    <span className="text-sm font-black uppercase italic text-zinc-900">{lot?.model || 'N/A'}</span>
                </div>
                <div className="bg-white border-2 border-zinc-100 rounded-[32px] p-6 space-y-2">
                    <div className="bg-zinc-50 w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400"><LayoutGrid size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Category</span>
                    <span className="text-sm font-black uppercase italic text-zinc-900">{lot?.categories?.name || 'GENERIC'}</span>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white border-2 border-zinc-100 rounded-[40px] p-10 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl"><Info className="text-primary" size={20} /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm italic">Asset Description</h3>
                </div>
                <p className="text-zinc-600 leading-relaxed font-medium">
                    {lot?.description || "No extended description provided for this asset."}
                </p>
            </div>

            {/* Bidding History */}
            <div className="bg-white border-2 border-zinc-100 rounded-[40px] p-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl"><History className="text-primary" size={20} /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm italic">Bidding History</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                                <th className="pb-4">Bidder Identity</th>
                                <th className="pb-4 text-center">Amount</th>
                                <th className="pb-4 text-center">Status</th>
                                <th className="pb-4 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 font-sans">
                            {bids.map((bid: any) => (
                                <tr key={bid.id} className="group">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 text-zinc-400 font-black text-[10px]">
                                                {bid.profiles?.full_name?.charAt(0) || 'U'}
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

            {/* Metadata JSONB Viewer */}
            {lot?.metadata && Object.keys(lot.metadata).length > 0 && (
                <div className="bg-zinc-50 border-2 border-zinc-100 rounded-[40px] p-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-900 p-3 rounded-xl text-white"><LayoutGrid size={20} /></div>
                        <h3 className="font-black uppercase tracking-widest text-sm italic text-zinc-900">Imported Attributes (JSONB)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(lot.metadata).map(([key, value]) => (
                            <div key={key} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{key.replace(/_/g, ' ')}</span>
                                <span className="text-sm font-bold text-zinc-900 italic uppercase">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <div className="bg-zinc-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8">Financial Overview</h3>
                    <div className="space-y-8">
                        <div className="flex justify-between items-end border-b border-white/5 pb-6">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active High Bid</span>
                            <span className="text-4xl font-black italic tabular-nums text-primary">${Number(lot?.current_price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Opening Bid</span>
                            <span className="font-bold tabular-nums text-white/80">${Number(lot?.start_price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Engagement</span>
                            <span className="font-bold tabular-nums text-white/80">{bids.length} Total Bids</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Minimum Increment</span>
                            <span className="font-bold tabular-nums text-white/80">${Number(lot?.min_increment).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-primary/10 blur-[100px] rounded-full"></div>
            </div>

            {/* Quick Actions / More Info */}
            <div className="bg-white border-2 border-zinc-100 rounded-[40px] p-10 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">System Information</h3>
                </div>
                <div className="space-y-4 pt-4">
                    <div className="flex justify-between border-b border-zinc-50 pb-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Database ID</span>
                        <span className="text-[10px] font-mono text-zinc-900 font-bold">{lot?.id?.slice(0,18)}...</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-50 pb-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Registered Date</span>
                        <span className="text-[10px] font-bold text-zinc-900 uppercase italic">{new Date(lot?.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between pb-4">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">End Date</span>
                        <span className="text-[10px] font-bold text-zinc-900 uppercase italic">{new Date(lot?.ends_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
