'use client'

import { useList } from "@refinedev/core"
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Activity,
  History,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

export const Dashboard = () => {
  // Fetching all necessary resources with pagination disabled for accurate totals
  const eventsResult = useList({ resource: "auction_events", pagination: { mode: "off" } })
  const auctionsResult = useList({ resource: "auctions", pagination: { mode: "off" } })
  const profilesResult = useList({ resource: "profiles", pagination: { mode: "off" } })
  const bidsResult = useList({ resource: "bids", pagination: { mode: "off" } })

  // Refine v5 data extraction path: .query.data.data
  const events = (eventsResult as any).query?.data?.data || []
  const auctions = (auctionsResult as any).query?.data?.data || []
  const profiles = (profilesResult as any).query?.data?.data || []
  const bids = (bidsResult as any).query?.data?.data || []
  
  const isLoading = (eventsResult as any).query?.isLoading || (auctionsResult as any).query?.isLoading

  const totalEvents = (eventsResult as any).query?.data?.total || events.length
  const totalLots = (auctionsResult as any).query?.data?.total || auctions.length
  const totalUsers = (profilesResult as any).query?.data?.total || profiles.length

  const liveEvents = events.filter((e: any) => e.status === 'live').length
  const activeLots = auctions.filter((a: any) => a.status === 'live').length
  const totalRevenue = auctions.filter((a: any) => a.status === 'sold').reduce((acc: number, curr: any) => acc + (Number(curr.current_price) || 0), 0)

  const stats = [
    { 
        label: "Live Events", 
        value: liveEvents, 
        icon: Calendar, 
        color: "text-blue-600", 
        bg: "bg-blue-50" 
    },
    { 
        label: "Total Inventory", 
        value: totalLots, 
        icon: ShoppingCart, 
        color: "text-indigo-600", 
        bg: "bg-indigo-50" 
    },
    { 
        label: "Total Revenue", 
        value: `$${totalRevenue.toLocaleString()}`, 
        icon: DollarSign, 
        color: "text-emerald-600", 
        bg: "bg-emerald-50" 
    },
    { 
        label: "Global Users", 
        value: totalUsers, 
        icon: Users, 
        color: "text-violet-600", 
        bg: "bg-violet-50" 
    },
  ]

  if (isLoading) {
    return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Activity className="h-10 w-10 text-primary animate-spin" />
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing Real-time Intel...</p>
        </div>
    )
  }

  return (
    <div className="space-y-8 text-zinc-900 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Real-time Performance Metrics</p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl border transition-colors", stat.bg)}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold tabular-nums tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Stream */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History size={16} className="text-zinc-400" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Global Bidding stream</h2>
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">Live</span>
                </div>
            </div>
            <div className="overflow-x-auto text-sm">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-50 font-sans">
                        {bids.slice(0, 8).map((bid: any) => (
                            <tr key={bid.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-zinc-900 uppercase text-[11px]">User #{bid.user_id.slice(0,8)}</span>
                                        <span className="text-[10px] text-zinc-400 italic font-medium truncate max-w-[120px]">Authorized Bidder</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black text-zinc-900 tabular-nums text-base italic">${Number(bid.amount).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-[4px] text-[9px] font-black border uppercase tracking-widest",
                                        bid.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-zinc-50 text-zinc-400 border-zinc-100"
                                    )}>{bid.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right text-zinc-400 text-[11px] tabular-nums font-mono">
                                    {new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                            </tr>
                        ))}
                        {bids.length === 0 && (
                            <tr>
                                <td className="p-20 text-center text-zinc-300 font-bold uppercase tracking-widest text-[10px] italic">Waiting for platform activity...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* System Health / Status */}
        <div className="space-y-6">
            <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-2xl shadow-zinc-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Engine Status</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Sync Latency</p>
                                <span className="text-xs font-bold font-mono text-primary">12ms</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[95%] bg-primary shadow-[0_0_10px_rgba(4,154,158,0.5)]"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Payment Trust</p>
                                <span className="text-xs font-bold font-mono text-emerald-400">Stable</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[100%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/5 italic">
                        <p className="text-[9px] text-white/30 font-medium leading-relaxed uppercase">
                            All systems operating within normal parameters. Real-time data pipeline is active.
                        </p>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/10 blur-3xl rounded-full"></div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Quick Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 bg-zinc-50 rounded-xl text-[10px] font-bold uppercase text-zinc-600 hover:bg-zinc-100 transition-colors">Audit Users</button>
                    <button className="p-3 bg-zinc-50 rounded-xl text-[10px] font-bold uppercase text-zinc-600 hover:bg-zinc-100 transition-colors">Reports</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
