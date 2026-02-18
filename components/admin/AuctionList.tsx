'use client'

import { useTable, useNavigation, useDelete, useForm, useSelect } from "@refinedev/core"
import { Edit, Trash2, Plus, Loader2, Package, Search, Save, Filter, Gavel, Eye, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Modal, ConfirmModal } from "./Modal"

export const AuctionList = () => {
  const result = useTable({
    resource: "auctions",
    meta: { select: "*, auction_events(title), bids(id)" },
    pagination: { pageSize: 10 }
  })

  const tableQuery = (result as any).tableQuery;
  const auctions = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { show } = useNavigation()
  const { 
    current = 1,
    setCurrent,
    currentPage = 1,
    setCurrentPage,
    pageCount = 1,
    setFilters, 
    filters 
  } = result as any

  const activePage = currentPage || current
  const setActivePage = setCurrentPage || setCurrent
  const { mutate: deleteRecord } = useDelete()

  // --- ÉTATS DES MODALES ---
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState("")

  // --- GESTION DES FORMULAIRES ---
  const createForm = useForm({ resource: "auctions", action: "create", onMutationSuccess: () => setIsCreateOpen(false) })
  const editForm = useForm({ resource: "auctions", action: "edit", id: selectedId || undefined, onMutationSuccess: () => setIsEditOpen(false) })
  
  const { options: categories } = useSelect({ resource: "categories" })

  const handleSearch = (val: string) => {
    setSearchValue(val)
    setFilters([{ field: "title", operator: "contains", value: val || undefined }], "merge")
  }

  const handleStatusFilter = (status: string) => {
    setFilters([{ field: "status", operator: "eq", value: status === "all" ? undefined : status }], "merge")
  }

  const handleEditClick = (id: string) => {
    setSelectedId(id)
    setIsEditOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setIsDeleteOpen(true)
  }

  const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
  const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block"

  if (isLoading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Filtering Inventory...</p>
    </div>
  )

  return (
    <div className="space-y-8 text-zinc-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory</h1>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{auctions.length} Lots Managed</p>
        </div>
        <button 
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
        >
            <Plus size={16} /> Create New Lot
        </button>
      </div>

      {/* Barre de recherche et filtres RÉ-INTÉGRÉS */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
                type="text" 
                placeholder="Search lots by title..." 
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-none outline-none focus:ring-0 placeholder:text-zinc-400 bg-transparent"
            />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'live', 'sold', 'draft'].map((s) => (
                <button
                    key={s}
                    onClick={() => handleStatusFilter(s)}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                        (filters.find((f: any) => f.field === "status")?.value === s || (s === 'all' && !filters.find((f: any) => f.field === "status")?.value))
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-md" 
                        : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                    )}
                >
                    {s}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-6 py-5 uppercase text-[10px] tracking-widest w-20 text-center">Lot #</th>
                <th className="px-6 py-5 uppercase text-[10px] tracking-widest w-16">Item</th>
                <th className="px-6 py-5 uppercase text-[10px] tracking-widest">Asset Details</th>
                <th className="px-6 py-5 uppercase text-[10px] tracking-widest font-sans">Event</th>
                <th className="px-6 py-5 uppercase text-[10px] tracking-widest font-sans">Activity</th>
                <th className="px-6 py-5 uppercase text-[10px] tracking-widest font-sans text-right">Value</th>
                <th className="px-6 py-5 uppercase text-[10px] tracking-widest font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-sans">
              {auctions.map((auction: any) => (
                <tr key={auction.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-5 font-black text-zinc-900 text-center">
                    {auction.lot_number || '---'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                        {auction.image_url ? (
                            <img src={auction.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-300">
                                <Package size={16} />
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 text-base">{auction.title}</span>
                        <span className="text-[10px] text-zinc-400 font-mono italic uppercase">#{auction.id.slice(0,8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase">
                        {auction.auction_events?.title || 'UNASSIGNED'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <Gavel size={14} className={auction.bids?.length > 0 ? "text-primary" : "text-zinc-300"} />
                        <span className="font-bold text-zinc-900">{auction.bids?.length || 0} Bids</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-zinc-900 tabular-nums">
                    ${Number(auction.current_price).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right font-sans">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => show("auctions", auction.id)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"><Eye size={18} /></button>
                        <button onClick={() => handleEditClick(auction.id)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteClick(auction.id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {auctions.length === 0 && (
                <tr>
                    <td colSpan={3} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-zinc-300">
                            <Package size={40} strokeWidth={1} />
                            <p className="text-sm font-medium uppercase tracking-widest italic text-zinc-400">No results found</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && setActivePage && (
        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page</span>
                <span className="text-xs font-black italic">{activePage} / {pageCount}</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    disabled={activePage === 1}
                    onClick={() => setActivePage(activePage - 1)}
                    className="p-2 border border-zinc-100 rounded-lg hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400"
                >
                    <ArrowLeft size={16} />
                </button>
                <button 
                    disabled={activePage === pageCount}
                    onClick={() => setActivePage(activePage + 1)}
                    className="p-2 border border-zinc-100 rounded-lg hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400 rotate-180"
                >
                    <ArrowLeft size={16} />
                </button>
            </div>
        </div>
      )}

      {/* --- MODALES --- */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Auction Lot">
        <form onSubmit={(e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)); createForm.onFinish(d); }} className="p-8 space-y-6">
            <div className="space-y-4 font-sans">
                <div>
                    <label className={labelClasses}>Asset Title</label>
                    <input name="title" required className={inputClasses} placeholder="Haas CNC VF-2..." />
                </div>
                <div className="grid grid-cols-2 gap-4 font-sans">
                    <div>
                        <label className={labelClasses}>Category</label>
                        <select name="category_id" required className={inputClasses}>
                            {categories?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Start Price ($)</label>
                        <input name="start_price" type="number" required className={inputClasses} />
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Status</label>
                    <select name="status" defaultValue="draft" className={inputClasses}>
                        <option value="draft">Draft</option>
                        <option value="live">Live</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button disabled={createForm.formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    {createForm.formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Publish Lot</>}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Auction Details">
        <form 
            onSubmit={(e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)); editForm.onFinish(d); }} 
            className="p-8 space-y-6 font-sans"
        >
            <div className="space-y-4">
                <div>
                    <label className={labelClasses}>Asset Title</label>
                    <input name="title" defaultValue={(editForm as any).queryResult?.data?.data?.title} required className={inputClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Status</label>
                    <select name="status" defaultValue={(editForm as any).queryResult?.data?.data?.status} className={inputClasses}>
                        <option value="draft">Draft</option>
                        <option value="live">Live</option>
                        <option value="sold">Sold</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end pt-4 font-sans">
                <button disabled={editForm.formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    {editForm.formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Update Changes</>}
                </button>
            </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => deleteRecord({ resource: "auctions", id: selectedId! })}
        title="Revoke Asset"
        message="Are you sure you want to permanently remove this lot from the inventory?"
        confirmText="Remove Lot"
        variant="danger"
      />
    </div>
  )
}
