'use client'

import { useTable, useNavigation, useDelete, useForm } from "@refinedev/core"
import { BadgeCheck, ShieldAlert, User, Search, Plus, Trash2, ShieldCheck as StaffIcon, Loader2, Eye, Mail, Key, Save, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Modal, ConfirmModal } from "./Modal"
import { adminCreateUser } from "@/app/actions/users"

export const UserList = () => {
  const result = useTable({
    resource: "profiles",
    pagination: { pageSize: 20 }
  })

  const tableQuery = (result as any).tableQuery;
  const profiles = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { 
    current,
    setCurrent,
    pageCount,
    setFilters 
  } = result as any
  const { show } = useNavigation()
  const { mutate: deleteRecord } = useDelete()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError(null)
    const formData = new FormData(e.currentTarget)
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        full_name: formData.get('full_name') as string,
        role: formData.get('role') as string,
    }
    const res = await adminCreateUser(data)
    if (res.success) {
        setIsCreateOpen(false)
        result.tableQuery.refetch()
    } else {
        setCreateError(res.error || "Failed to create user")
    }
    setCreateLoading(false)
  }

  const handleSearch = (val: string) => {
    setFilters([{ field: "full_name", operator: "contains", value: val || undefined }], "replace")
  }

  const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900"
  const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block"

  if (isLoading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing Directory...</p>
    </div>
  )

  return (
    <div className="space-y-6 text-zinc-900 font-sans">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Access Control & Identity Audit</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm active:scale-95 transition-all hover:bg-zinc-800">
            <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3">
        <Search className="text-zinc-400" size={18} />
        <input type="text" placeholder="Search by name..." onChange={(e) => handleSearch(e.target.value)} className="flex-1 outline-none text-sm bg-transparent" />
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden text-sm font-sans">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 font-medium border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest">Identity</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-center">Role</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-right">Bidding Status</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-right italic">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {profiles.map((profile: any) => (
              <tr key={profile.id} className="hover:bg-zinc-50/50 transition-colors group text-zinc-900">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200"><User size={14} className="text-zinc-400" /></div>
                        <div className="flex flex-col">
                            <span className="font-bold uppercase tracking-tighter">{profile.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">#{profile.id.slice(0,8)}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest",
                      profile.role === 'admin' ? "bg-zinc-900 text-white border-zinc-950 shadow-sm" : 
                      profile.role === 'moderator' ? "bg-blue-50 text-blue-700 border-blue-100" :
                      "bg-zinc-50 text-zinc-500 border-zinc-200"
                  )}>{profile.role}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {profile.role === 'admin' || profile.role === 'moderator' ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-400 font-black text-[10px] uppercase">
                          <StaffIcon size={14} /> AUTHORIZED STAFF
                      </span>
                  ) : profile.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                          <BadgeCheck size={14} /> VERIFIED BIDDER
                      </span>
                  ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-400 font-black text-[10px] uppercase italic">
                          <ShieldAlert size={14} /> UNVERIFIED
                      </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => show("profiles", profile.id)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"><Eye size={16} /></button>
                        <button onClick={() => { setSelectedId(profile.id); setIsDeleteOpen(true); }} className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 size={16} /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Directory Page</span>
                <span className="text-xs font-black italic">{current} / {pageCount}</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    disabled={current === 1}
                    onClick={() => setCurrent(current - 1)}
                    className="p-2 border border-zinc-100 rounded-lg hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400"
                >
                    <ArrowLeft size={16} />
                </button>
                <button 
                    disabled={current === pageCount}
                    onClick={() => setCurrent(current + 1)}
                    className="p-2 border border-zinc-100 rounded-lg hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400 rotate-180"
                >
                    <ArrowLeft size={16} />
                </button>
            </div>
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Provision New User" maxWidth="max-w-md">
        <form onSubmit={handleCreateSubmit} className="p-8 space-y-6 font-sans">
            {createError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2 italic">
                    <ShieldAlert size={16} /> {createError}
                </div>
            )}

            <div className="space-y-4 font-sans text-zinc-900">
                <div>
                    <label className={labelClasses}>Full Identity Name</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input name="full_name" required className={cn(inputClasses, "pl-10")} placeholder="e.g. John Doe" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Professional Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input name="email" type="email" required className={cn(inputClasses, "pl-10")} placeholder="name@company.com" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans">
                    <div>
                        <label className={labelClasses}>Set Password</label>
                        <div className="relative">
                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input name="password" type="password" required className={cn(inputClasses, "pl-10")} placeholder="••••••••" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Access Role</label>
                        <select name="role" required className={inputClasses}>
                            <option value="client">Client</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 font-sans">
                <button 
                    disabled={createLoading} 
                    className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
                >
                    {createLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Provision Account</>}
                </button>
            </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => deleteRecord({ resource: "profiles", id: selectedId! })}
        title="Revoke Access"
        message="Are you sure? This user will no longer be able to access the platform."
        confirmText="Revoke Account"
        variant="danger"
      />
    </div>
  )
}
