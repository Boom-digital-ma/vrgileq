'use client'

import { useShow, useList } from "@refinedev/core"
import { ArrowLeft, User, Mail, Shield, Calendar, BadgeCheck, ShieldAlert, History, Gavel } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const UserShow = () => {
  const result = useShow({
    resource: "profiles",
  })

  // SÉCURISATION REFINE v5
  const queryResult = (result as any)?.queryResult || (result as any)?.query;
  const { data, isLoading } = queryResult || {}
  const record = data?.data

  // Fetch bids for this user
  const bidsResult = useList({
    resource: "bids",
    filters: [
      {
        field: "user_id",
        operator: "eq",
        value: record?.id
      }
    ],
    meta: { select: "*, auctions(title)" },
    queryOptions: { enabled: !!record?.id }
  })

  const bidsQuery = (bidsResult as any).query;
  const bids = bidsQuery?.data?.data || []
  const isBidsLoading = bidsQuery?.isLoading

  if (isLoading || !queryResult) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Assembling User Dossier...</p>
    </div>
  )

  return (
    <div className="space-y-8 font-sans text-zinc-900">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">User Dossier</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Security Ref: #{record?.id?.slice(0,8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="h-24 w-24 bg-zinc-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl mb-4 text-zinc-400">
                        <User size={40} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-tighter">{record?.full_name || 'Anonymous'}</h2>
                    <span className={cn(
                        "mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        record?.role === 'admin' ? "bg-zinc-900 text-white border-zinc-950" : "bg-zinc-50 text-zinc-500 border-zinc-200"
                    )}>
                        {record?.role}
                    </span>
                </div>

                <div className="space-y-4 border-t border-zinc-50 pt-6">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail size={16} className="text-zinc-400" />
                        <span className="text-zinc-600 font-medium">{record?.email || 'System Account'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Shield size={16} className="text-zinc-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase font-sans">Identity Status</span>
                            {record?.is_verified ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1 font-sans">
                                    <BadgeCheck size={14} /> Fully Verified
                                </span>
                            ) : (
                                <span className="text-rose-400 font-bold flex items-center gap-1 italic font-sans">
                                    <ShieldAlert size={14} /> Pending ID Check
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-4 font-sans">
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2 font-sans">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Gavel size={18} /></div>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Active Bids</span>
                    </div>
                    <p className="text-2xl font-bold">{bids.filter((b: any) => b.status === 'active').length}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm font-sans">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><BadgeCheck size={18} /></div>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Lots Won</span>
                    </div>
                    <p className="text-2xl font-bold">{bids.filter((b: any) => b.status === 'won').length}</p>
                </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden font-sans">
                <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-2">
                    <History size={18} className="text-zinc-400" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">Bid History Log</h3>
                </div>
                <div className="overflow-x-auto text-sm font-sans">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/20 font-sans">
                                <th className="px-8 py-4 uppercase text-[10px] tracking-widest font-sans">Lot Name</th>
                                <th className="px-8 py-4 uppercase text-[10px] tracking-widest font-sans">Amount</th>
                                <th className="px-8 py-4 uppercase text-[10px] tracking-widest text-right font-sans">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 font-sans">
                            {bids.map((bid: any) => (
                                <tr key={bid.id} className="hover:bg-zinc-50/50 transition-colors font-sans">
                                    <td className="px-8 py-4 font-bold text-zinc-900 font-sans">{bid.auctions?.title}</td>
                                    <td className="px-8 py-4 font-bold text-emerald-600 tabular-nums font-sans">${Number(bid.amount).toLocaleString()}</td>
                                    <td className="px-8 py-4 text-right font-sans">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest font-sans",
                                            bid.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-50 text-zinc-400 border-zinc-100"
                                        )}>{bid.status}</span>
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
