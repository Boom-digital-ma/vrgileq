'use client'

import { useTable } from "@refinedev/core"
import { BadgeCheck, ShieldAlert, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export const ProfileList = () => {
  const result = useTable({
    resource: "profiles",
    pagination: { pageSize: 10 }
  })

  const tableQuery = (result as any).tableQuery;
  const profiles = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { setFilters } = result

  const handleSearch = (val: string) => {
    setFilters([
      { field: "full_name", operator: "contains", value: val || undefined }
    ], "replace")
  }

  if (isLoading) return <div className="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Accessing User Directory...</div>

  return (
    <div className="space-y-6 text-zinc-900">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bidder Audit</h1>
        <p className="text-sm text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Identity Verification Control</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3">
        <Search className="text-zinc-400" size={18} />
        <input 
            type="text" 
            placeholder="Search bidders by name..." 
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 font-medium border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Full Name / Identity</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-center">Role</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-right">Security</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {profiles.map((profile: any) => (
              <tr key={profile.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                            <User size={14} className="text-zinc-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold uppercase tracking-tighter">{profile.full_name || 'Anonymous User'}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">ID: {profile.id.slice(0,8)}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest",
                      profile.role === 'admin' ? "bg-zinc-900 text-white border-zinc-950" : "bg-zinc-50 text-zinc-500 border-zinc-200"
                  )}>
                      {profile.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {profile.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                          <BadgeCheck size={14} /> VERIFIED
                      </span>
                  ) : (
                      <span className="inline-flex items-center gap-1.5 text-zinc-300 font-black text-[10px] uppercase italic">
                          <ShieldAlert size={14} /> PENDING
                      </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
