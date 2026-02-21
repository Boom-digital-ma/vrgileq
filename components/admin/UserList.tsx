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
    pagination: { pageSize: 10 }
  })

  const tableQuery = (result as any).tableQuery;
  const profiles = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { 
    current,
    setCurrent,
    currentPage,
    setCurrentPage,
    pageCount,
    setFilters 
  } = result as any

  // Safety aliasing for Refine v5 inconsistencies
  const activePage = currentPage || current;
  const goToPage = setCurrentPage || setCurrent;

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

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const applyFilters = (query: string, role: string, status: string) => {
    const filters = []
    
    if (query) {
      filters.push({
        operator: "or" as const,
        value: [
          { field: "full_name", operator: "contains", value: query },
          { field: "email", operator: "contains", value: query },
          { field: "id", operator: "contains", value: query },
        ]
      })
    }

    if (role) {
      filters.push({ field: "role", operator: "eq", value: role })
    }

    if (status) {
      filters.push({ field: "is_verified", operator: "eq", value: status === "verified" })
    }

    setFilters(filters)
  }

  const handleSearch = (val: string) => {
    setSearchQuery(val)
    applyFilters(val, roleFilter, statusFilter)
  }

  const handleRoleChange = (val: string) => {
    setRoleFilter(val)
    applyFilters(searchQuery, val, statusFilter)
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    applyFilters(searchQuery, roleFilter, val)
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
    <div className="space-y-6 text-zinc-900 font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">User Registry</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px] italic">Security Directory • {profiles.length} Active Records</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2">
            <Plus size={16} /> Provision New Account
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-2xl px-4 h-12 w-full">
            <Search className="text-zinc-400 shrink-0" size={18} />
            <input 
                type="text" 
                placeholder="Search by Identity, Email or ID..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)} 
                className="flex-1 outline-none text-sm bg-transparent font-sans placeholder:text-zinc-400" 
            />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
            <select 
                value={roleFilter}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="h-12 bg-white border border-zinc-200 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all w-full md:w-40 italic"
            >
                <option value="">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="moderator">Moderator</option>
                <option value="client">Client</option>
            </select>

            <select 
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-12 bg-white border border-zinc-200 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest text-zinc-900 outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all w-full md:w-40 italic"
            >
                <option value="">All Verification</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
            </select>

            {(searchQuery || roleFilter || statusFilter) && (
                <button 
                    onClick={() => {
                        setSearchQuery("");
                        setRoleFilter("");
                        setStatusFilter("");
                        setFilters([]);
                    }}
                    className="h-12 w-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all shrink-0"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden text-sm font-sans">
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/50 text-[10px] uppercase tracking-widest font-sans italic">
              <th className="px-8 py-5">Identity Protocol</th>
              <th className="px-8 py-5">Contact Node</th>
              <th className="px-8 py-5 text-center">Authorization</th>
              <th className="px-8 py-5 text-right">Verification</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-sans">
            {profiles.map((profile: any) => (
              <tr key={profile.id} className="hover:bg-zinc-50/50 transition-colors group text-zinc-900">
                <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100 group-hover:border-primary/20 transition-colors">
                            <User size={18} className="text-zinc-300 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 uppercase tracking-tight text-sm leading-none mb-1.5">{profile.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-zinc-400 font-mono italic">UID: {profile.id.slice(0,8)}</span>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-600 font-medium">
                        <Mail size={14} className="text-zinc-300" />
                        <span className="text-xs italic">{profile.email || 'N/A'}</span>
                    </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-[0.15em]",
                      profile.role === 'admin' ? "bg-zinc-900 text-white border-zinc-950 shadow-sm" : 
                      profile.role === 'moderator' ? "bg-blue-50 text-blue-700 border-blue-100" :
                      "bg-zinc-50 text-zinc-500 border-zinc-200"
                  )}>{profile.role}</span>
                </td>
                <td className="px-8 py-6 text-right font-sans">
                  {profile.role === 'admin' || profile.role === 'moderator' ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-300 font-black text-[9px] uppercase tracking-widest italic">
                          INTERNAL STAFF
                      </span>
                  ) : profile.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                          <BadgeCheck size={14} /> SECURITY CLEARED
                      </span>
                  ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-400 font-black text-[9px] uppercase tracking-widest italic">
                          <ShieldAlert size={14} /> PENDING REVIEW
                      </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right font-sans">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all font-sans">
                        <button onClick={() => show("profiles", profile.id)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"><Eye size={18} /></button>
                        <button onClick={() => { setSelectedId(profile.id); setIsDeleteOpen(true); }} className="p-2 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
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
                <span className="text-xs font-black italic">{activePage} / {pageCount}</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    disabled={activePage === 1}
                    onClick={() => goToPage(activePage - 1)}
                    className="p-2 border border-zinc-100 rounded-lg hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400"
                >
                    <ArrowLeft size={16} />
                </button>
                <button 
                    disabled={activePage === pageCount}
                    onClick={() => goToPage(activePage + 1)}
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
