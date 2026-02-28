'use client'

import { useList } from "@refinedev/core"
import { 
  Users, 
  DollarSign, 
  Activity,
  Calendar,
  Truck,
  FileText,
  Gavel,
  Package,
  Flame,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CreditCard,
  Target,
  ChevronRight,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import { cn, formatEventDateShort, formatEventDate } from "@/lib/utils"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell
} from 'recharts'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'

export const Dashboard = () => {
  // Fetching resources with strategic metadata
  const eventsResult = useList({ resource: "auction_events", pagination: { mode: "off" } })
  const auctionsResult = useList({ resource: "auctions", meta: { select: "*, bids(id)" }, pagination: { mode: "off" } })
  const profilesResult = useList({ resource: "profiles", pagination: { mode: "off" } })
  const salesResult = useList({ resource: "sales", pagination: { mode: "off" } })
  const registrationsResult = useList({ resource: "event_registrations", pagination: { mode: "off" } })
  const pickupSlotsResult = useList({ resource: "pickup_slots", pagination: { mode: "off" } })
  
  // Trend Data Query (All bids from last 7 days)
  const trendBidsResult = useList({
    resource: "bids",
    filters: [
        {
            field: "created_at",
            operator: "gte",
            value: subDays(new Date(), 7).toISOString()
        }
    ],
    pagination: { mode: "off" }
  })

  // Live Activity Feed (Recent Bids) - ENABLED REAL-TIME LIVE MODE
  const recentBidsResult = useList({ 
    resource: "bids", 
    meta: { select: "*, auctions(title, lot_number), profiles:user_id(full_name, id)" },
    pagination: { pageSize: 8 }, 
    sorters: [{ field: "created_at", order: "desc" }],
    liveMode: "auto", 
  })

  // Data Extraction
  const events = (eventsResult as any).query?.data?.data || []
  const auctions = (auctionsResult as any).query?.data?.data || []
  const profiles = (profilesResult as any).query?.data?.data || []
  const sales = (salesResult as any).query?.data?.data || []
  const registrations = (registrationsResult as any).query?.data?.data || []
  const pickupSlots = (pickupSlotsResult as any).query?.data?.data || []
  const trendBids = (trendBidsResult as any).query?.data?.data || []
  const recentBids = (recentBidsResult as any).query?.data?.data || []
  
  const isLoading = (eventsResult as any).query?.isLoading || (auctionsResult as any).query?.isLoading || (salesResult as any).query?.isLoading

  // --- KPI CALCULATIONS ---

  // 1. Financial Performance
  const totalRevenue = sales.filter((s: any) => s.status === 'paid').reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0)
  const pendingRevenue = sales.filter((s: any) => s.status === 'pending').reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0)
  
  // 2. Velocity & Engagement
  const liveLots = auctions.filter((a: any) => a.status === 'live')
  const totalBidsCount = auctions.reduce((acc: number, a: any) => acc + (a.bids?.length || 0), 0)
  const avgBidsPerLot = auctions.length > 0 ? (totalBidsCount / auctions.length).toFixed(1) : "0"
  
  // 3. New KPIs
  const activeHolds = registrations.filter((r: any) => r.status === 'authorized').length
  const verifiedProfiles = profiles.filter((p: any) => p.is_verified).length
  const verificationRate = profiles.length > 0 ? Math.round((verifiedProfiles / profiles.length) * 100) : 0
  
  // 4. Logistics
  const collectedLotsCount = sales.filter((s: any) => !!s.collected_at).length
  const soldLotsCount = sales.length
  const pickupRate = soldLotsCount > 0 ? Math.round((collectedLotsCount / soldLotsCount) * 100) : 0
  const coldLotsCount = liveLots.filter((a: any) => (a.bids?.length || 0) === 0).length

  // --- DATA TRANSFORMATION FOR CHARTS ---

  // 1. Trend Data (Bids over last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    return {
        date: format(d, 'MMM dd'),
        count: trendBids.filter((b: any) => isSameDay(new Date(b.created_at), d)).length,
        fullDate: d
    }
  })

  // 2. Top Bidders Leaderboard
  const bidderStats = trendBids.reduce((acc: any, bid: any) => {
    const userId = bid.user_id
    if (!userId) return acc
    if (!acc[userId]) {
        const profile = profiles.find((p: any) => p.id === userId)
        acc[userId] = { 
            name: profile?.full_name || 'Bidder ' + userId.substring(0, 4), 
            count: 0, 
            total: 0 
        }
    }
    acc[userId].count += 1
    acc[userId].total += Number(bid.amount)
    return acc
  }, {})

  const topBidders = Object.values(bidderStats)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5)

  const primaryStats = [
    { 
        label: "Gross Volume (Paid)", 
        value: `$${totalRevenue.toLocaleString()}`, 
        subValue: `+$${pendingRevenue.toLocaleString()} pending`,
        icon: DollarSign, 
        color: "text-emerald-600", 
        bg: "bg-emerald-50",
        border: "border-emerald-100"
    },
    { 
        label: "Registration Holds", 
        value: activeHolds.toString(), 
        subValue: "Active Stripe Auth",
        icon: CreditCard, 
        color: "text-blue-600", 
        bg: "bg-blue-50",
        border: "border-blue-100"
    },
    { 
        label: "Total Bids Placed", 
        value: totalBidsCount.toLocaleString(), 
        subValue: `${avgBidsPerLot} avg per lot`,
        icon: Gavel, 
        color: "text-amber-600", 
        bg: "bg-amber-50",
        border: "border-amber-100"
    },
    { 
        label: "Verified Accounts", 
        value: `${verificationRate}%`, 
        subValue: `${verifiedProfiles} of ${profiles.length} users`,
        icon: UserCheck, 
        color: "text-violet-600", 
        bg: "bg-violet-50",
        border: "border-violet-100"
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
    <div className="space-y-8 text-zinc-900 font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Unified Operational Intelligence</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-2xl shadow-xl">
            <Activity size={14} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-2xl border transition-colors group-hover:bg-white", stat.bg, stat.border)}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div className="h-10 w-20 opacity-40 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last7Days}>
                        <Area type="monotone" dataKey="count" stroke={stat.color.replace('text-', '#').replace('-600', '')} fill={stat.color.replace('text-', '#').replace('-600', '')} fillOpacity={0.1} />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-3xl font-black tabular-nums tracking-tighter italic">{stat.value}</h3>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-2">{stat.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-2">
                        <TrendingUp size={14} className="text-primary" /> Engagement Velocity
                    </h3>
                    <p className="text-sm font-bold italic">Global Bid Volume (Last 7 Days)</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary/20 border border-primary"></div>
                        <span className="text-[10px] font-bold text-zinc-500">Live Signals</span>
                    </div>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last7Days}>
                        <defs>
                            <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#049A9E" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#049A9E" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#A1A1AA' }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#A1A1AA' }}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            labelStyle={{ fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#049A9E" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorBids)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Bidders Leaderboard */}
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                <Target size={14} className="text-amber-500" /> Top Participants
            </h3>
            <div className="space-y-4 flex-1">
                {topBidders.map((bidder: any, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center font-black text-xs italic shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                #{i+1}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-tight">{bidder.name}</span>
                                <span className="text-[10px] font-bold text-zinc-400">{bidder.count} Total Bids</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-black text-secondary tabular-nums italic">${bidder.total.toLocaleString()}</span>
                            <div className="flex items-center justify-end text-[9px] text-emerald-500 font-bold">
                                <ArrowUpRight size={10} /> VIP
                            </div>
                        </div>
                    </div>
                ))}
                {topBidders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-300 gap-2">
                        <Users size={40} className="opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Bidders Yet</p>
                    </div>
                )}
            </div>
            <Link href="/admin/users" className="w-full mt-6 py-3 border border-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2">
                Explore All Profiles <ChevronRight size={12} />
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pickup Calendar Summary */}
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Calendar size={14} className="text-rose-500" /> Pickup Capacity
                </h3>
                <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[9px] font-black rounded-lg uppercase italic">Next Phase</span>
            </div>
            
            <div className="space-y-4">
                {pickupSlots.slice(0, 5).map((slot: any) => {
                    const bookingCount = sales.filter((s: any) => s.pickup_slot_id === slot.id).length
                    const percentage = Math.round((bookingCount / (slot.max_capacity || 1)) * 100)
                    const event = events.find((e: any) => e.id === slot.event_id)
                    
                    return (
                        <div key={slot.id} className="space-y-2 group">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex flex-col">
                                    <span className="text-zinc-900 uppercase">{format(new Date(slot.start_at), 'MMM dd @ HH:mm')}</span>
                                    <span className="text-[8px] text-zinc-400 truncate max-w-[120px]">{event?.title || 'General Event'}</span>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full border transition-colors",
                                    percentage > 80 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-zinc-50 text-zinc-600 border-zinc-100 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
                                )}>
                                    {bookingCount} / {slot.max_capacity} Slots
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div 
                                    className={cn(
                                        "h-full transition-all duration-700 ease-out",
                                        percentage > 80 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-primary shadow-[0_0_8px_rgba(4,154,158,0.4)]"
                                    )} 
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
                {pickupSlots.length === 0 && (
                    <p className="text-center py-10 text-zinc-300 text-[10px] font-black uppercase tracking-widest">No Slots Scheduled</p>
                )}
            </div>
        </div>

        {/* Operational Health (Revised) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inventory & Financial Health */}
            <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> Operational Integrity
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-amber-50 rounded-2xl border border-amber-100 group hover:bg-amber-100 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Pending Collections</span>
                            <span className="text-xl font-black text-amber-600 tabular-nums italic">${pendingRevenue.toLocaleString()}</span>
                        </div>
                        <AlertCircle size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:bg-zinc-100 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Cold Inventory (No Bids)</span>
                            <span className="text-xl font-black text-zinc-900 tabular-nums italic">{coldLotsCount} Assets</span>
                        </div>
                        <Package size={24} className="text-zinc-300 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Logistics Engine (Revised) */}
            <div className="bg-zinc-900 rounded-[32px] p-8 text-white shadow-2xl shadow-zinc-200 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Truck size={16} className="text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Fullfilment Velocity</h3>
                        </div>
                        <span className="px-2 py-1 rounded bg-white/10 text-[9px] font-black uppercase text-primary border border-primary/20">Live Rate</span>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Pickup Success Rate</p>
                                <span className="text-3xl font-black font-mono text-primary italic">{pickupRate}%</span>
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary shadow-[0_0_15px_rgba(4,154,158,0.6)] transition-all duration-1000 group-hover:scale-x-105 origin-left"
                                    style={{ width: `${pickupRate}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-white/30 uppercase font-bold">Collected</span>
                                    <span className="text-xs font-black italic">{collectedLotsCount}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[8px] text-white/30 uppercase font-bold">Sold Total</span>
                                    <span className="text-xs font-black italic">{soldLotsCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 h-48 w-48 bg-primary/10 blur-3xl rounded-full transition-all duration-1000 group-hover:bg-primary/30"></div>
            </div>
        </div>
      </div>
      
      {/* Live Activity Stream (Condensed) */}
      <div className="bg-white border border-zinc-200 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity size={18} className="text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-tighter italic">Live Intelligence Stream</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-full shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest">Real-time Push</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-50 font-sans text-zinc-900">
                        {recentBids.map((bid: any) => (
                            <tr key={bid.id} className="hover:bg-zinc-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="px-2.5 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase border border-zinc-200 group-hover:bg-white transition-colors">
                                            Lot {bid.auctions?.lot_number || '-'}
                                        </div>
                                        <span className="font-bold text-xs truncate max-w-[200px] group-hover:text-primary transition-colors">{bid.auctions?.title || 'Unknown Asset'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black border border-zinc-200 uppercase group-hover:border-primary group-hover:text-primary transition-all shadow-sm">
                                            {bid.profiles?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-xs font-bold italic">{bid.profiles?.full_name || 'Anonymous Bidder'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-black text-secondary tabular-nums text-sm group-hover:text-primary transition-colors">${Number(bid.amount).toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 text-zinc-400 text-[10px] tabular-nums font-bold">
                                        <Clock size={10} />
                                        {formatEventDate(bid.created_at)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
      </div>
    </div>
  )
}
