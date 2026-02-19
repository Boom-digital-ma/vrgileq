'use client'

import { useShow, useList, useNavigation } from "@refinedev/core"
import { ArrowLeft, User, Mail, Shield, Calendar, BadgeCheck, ShieldAlert, History, Gavel, MapPin, Phone, DollarSign, Truck, FileText, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"

export const UserShow = () => {
  const { show } = useNavigation()
  const result = useShow({
    resource: "profiles",
  })

  // SÉCURISATION REFINE v5
  const queryResult = (result as any)?.queryResult || (result as any)?.query;
  const { data, isLoading } = queryResult || {}
  const record = data?.data

  // 1. Fetch bids for this user
  const bidsResult = useList({
    resource: "bids",
    filters: [{ field: "user_id", operator: "eq", value: record?.id }],
    meta: { select: "*, auctions(title)" },
    queryOptions: { enabled: !!record?.id }
  })
  const bids = (bidsResult as any).query?.data?.data || []

  // 2. Fetch sales (purchases) for this user
  const salesResult = useList({
    resource: "sales",
    filters: [{ field: "winner_id", operator: "eq", value: record?.id }],
    meta: { select: "*, auction:auctions(title, lot_number), pickup_slot:pickup_slots(*)" },
    queryOptions: { enabled: !!record?.id }
  })
  const sales = (salesResult as any).query?.data?.data || []

  if (isLoading || !queryResult) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Assembling User Dossier...</p>
    </div>
  )

  const totalSpent = sales.filter((s: any) => s.status === 'paid').reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0)
  const wonCount = sales.length
  const activeBidsCount = bids.filter((b: any) => b.status === 'active').length

  return (
    <div className="space-y-8 font-sans text-zinc-900 pb-20">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-8">
        <div className="flex items-center gap-4">
            <Link href="/admin/users" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter italic">User Dossier</h1>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest italic">Identity Ref: #{record?.id?.slice(0,8)}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {record?.is_verified ? (
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                    <BadgeCheck size={16} /> Verified Bidder
                </div>
            ) : (
                <div className="bg-rose-50 text-rose-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2 italic">
                    <ShieldAlert size={16} /> Pending Verification
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Profile & Contacts */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-[40px] p-10 shadow-sm sticky top-24">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="h-28 w-24 bg-zinc-50 rounded-[32px] flex items-center justify-center border-2 border-white shadow-2xl mb-6 text-zinc-300 relative overflow-hidden">
                        <User size={48} strokeWidth={1} />
                        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-zinc-100 to-transparent opacity-50" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tighter leading-none">{record?.full_name || 'Anonymous'}</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-3">{record?.role} Account</p>
                </div>

                <div className="space-y-6 border-t border-zinc-50 pt-8">
                    <div className="flex items-start gap-4 group">
                        <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400 group-hover:text-primary transition-colors"><Mail size={18} /></div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-0.5">Email Protocol</span>
                            <span className="text-sm font-bold text-zinc-600 truncate max-w-[180px]">{record?.email}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                        <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400 group-hover:text-primary transition-colors"><Phone size={18} /></div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-0.5">Mobile Hub</span>
                            <span className="text-sm font-bold text-zinc-600">{record?.phone || 'Not Provided'}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                        <div className="p-2.5 bg-zinc-50 rounded-xl text-zinc-400 group-hover:text-primary transition-colors"><MapPin size={18} /></div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-0.5">Physical Node</span>
                            <span className="text-sm font-bold text-zinc-600 leading-relaxed italic uppercase">
                                {record?.address_line || '---'}<br/>
                                {record?.city} {record?.state && `, ${record.state}`} {record?.zip_code}<br/>
                                {record?.country || 'USA'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content: Stats & History */}
        <div className="lg:col-span-8 space-y-8">
            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between italic">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Gavel size={20} /></div>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Active Bids</span>
                    </div>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter">{activeBidsCount}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between italic">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Truck size={20} /></div>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Lots Won</span>
                    </div>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter">{wonCount}</p>
                </div>
                <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-zinc-200 flex flex-col justify-between italic text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-xl text-primary"><DollarSign size={20} /></div>
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Settled Value</span>
                        </div>
                        <p className="text-4xl font-black tracking-tighter text-white">${totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-primary/10 blur-2xl rounded-full" />
                </div>
            </div>

            {/* Purchase & Logistics History */}
            <div className="bg-white border border-zinc-200 rounded-[40px] shadow-sm overflow-hidden font-sans">
                <div className="px-10 py-8 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-zinc-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Acquisition & Invoice Log</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter italic">Live Transmission</span>
                    </div>
                </div>
                <div className="overflow-x-auto text-sm font-sans">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/10 font-sans uppercase text-[9px] tracking-widest">
                                <th className="px-10 py-5 font-sans">Invoice / Lot</th>
                                <th className="px-10 py-5 font-sans">Removal Window</th>
                                <th className="px-10 py-5 font-sans text-right">Settlement</th>
                                <th className="px-10 py-5 font-sans text-right italic">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 font-sans">
                            {sales.map((sale: any) => (
                                <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors font-sans group">
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-zinc-900 uppercase text-[11px] leading-none mb-1.5">{sale.invoice_number}</span>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase truncate max-w-[200px]">{sale.auction?.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 font-sans">
                                        {sale.pickup_slot ? (
                                            <div className="flex items-center gap-3 text-emerald-600 font-bold">
                                                <Calendar size={14} />
                                                <span className="text-[11px] uppercase tracking-tight">{format(new Date(sale.pickup_slot.start_at), 'MMM dd')} @ {format(new Date(sale.pickup_slot.start_at), 'hh:mm a')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-zinc-300 uppercase font-black italic">No Appointment Set</span>
                                        )}
                                    </td>
                                    <td className="px-10 py-6 text-right font-sans">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-black text-zinc-900 tabular-nums text-base italic leading-none">${Number(sale.total_amount).toLocaleString()}</span>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border tracking-tighter",
                                                sale.status === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>{sale.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right font-sans">
                                        <button 
                                            onClick={() => show("sales", sale.id)}
                                            className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-xl transition-all"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-zinc-200 font-black uppercase tracking-widest text-xs italic">No confirmed acquisitions detected</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bid History */}
            <div className="bg-white border border-zinc-200 rounded-[40px] shadow-sm overflow-hidden font-sans">
                <div className="px-10 py-8 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-3">
                    <History size={20} className="text-zinc-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Technical Bidding Stream</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left font-sans">
                        <tbody className="divide-y divide-zinc-50">
                            {bids.map((bid: any) => (
                                <tr key={bid.id} className="hover:bg-zinc-50/50 transition-colors font-sans">
                                    <td className="px-10 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-900 text-[11px] leading-none mb-1 uppercase">{bid.auctions?.title}</span>
                                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{format(new Date(bid.created_at), 'MMM dd, hh:mm:ss a')}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-5 text-right font-sans">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-black text-zinc-900 tabular-nums text-sm italic">${Number(bid.amount).toLocaleString()}</span>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border tracking-tighter",
                                                bid.status === 'active' ? "bg-blue-50 text-blue-700 border-blue-100" : 
                                                bid.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                "bg-zinc-50 text-zinc-400 border-zinc-100"
                                            )}>{bid.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

