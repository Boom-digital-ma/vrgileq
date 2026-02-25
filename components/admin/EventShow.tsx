'use client'

import { useShow, useList, useNavigation, useDelete, useInvalidate, useTable } from "@refinedev/core"
import { ArrowLeft, Plus, Loader2, Package, Gavel, Trash2, Edit, Save, Eye, Search, Calendar, FileText, Shield, Unlock, MoreHorizontal, Zap, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Modal } from "./Modal"
import { ImageUpload } from "./ImageUpload"
import { adminUpsertLot } from "@/app/actions/lots"
import { generateEventPickupSlots, deleteEventPickupSlots } from "@/app/actions/events"
import { releaseEventDeposits } from "@/app/actions/payment"
import { generateEventInvoicesAction } from "@/app/actions/sales"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { formatEventDate } from "@/lib/utils"

export const EventShow = () => {
  const params = useParams()
  const eventId = params?.id as string
  const invalidate = useInvalidate()
  const supabase = createClient()
  
  // 1. Fetch Event Info
  const resultShow = useShow({ 
    resource: "auction_events",
    id: eventId 
  })
  const event = (resultShow as any).query?.data?.data
  const isEventLoading = (resultShow as any).query?.isLoading

  // 2. Table Data
  const resultTable = useTable({
    resource: "auctions",
    filters: {
        permanent: [{ field: "event_id", operator: "eq", value: eventId }]
    },
    pagination: { pageSize: 10 },
    syncWithLocation: false,
    queryOptions: { enabled: !!eventId },
    meta: { select: "*, auction_images(*), bids(id)" }
  })

  const tableQuery = (resultTable as any).tableQuery;
  const lots = tableQuery?.data?.data || []
  const total = tableQuery?.data?.total || 0
  const isLoadingLots = tableQuery?.isLoading

  // 2b. Fetch pickup info
  const pickupSlotsResult = useList({
    resource: "pickup_slots",
    filters: [
      { field: "event_id", operator: "eq", value: eventId }
    ],
    pagination: { mode: "off" }
  })
  const pickupCount = (pickupSlotsResult as any).query?.data?.total || (pickupSlotsResult as any).query?.data?.data?.length || 0

  const {
    current = 1,
    setCurrent,
    currentPage = 1,
    setCurrentPage,
    pageCount = 1,
    setFilters,
    filters = []
  } = (resultTable as any) || {}

  const activePage = currentPage || current
  const setActivePage = setCurrentPage || setCurrent

  // 3. Categories
  const { query: categoriesQuery } = useList({ resource: "categories" }) as any
  const categoriesList = categoriesQuery?.data?.data || []

  const { show } = useNavigation()
  const { mutate: deleteLot } = useDelete()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPickupOpen, setIsPickupOpen] = useState(false)
  const [selectedLotId, setSelectedId] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  
  // Custom Edit Fetching State
  const [editLotData, setEditLotData] = useState<any>(null)
  const [fetchingLot, setFetchingLot] = useState(false)

  const handleSearch = (val: string) => {
    setSearchValue(val)
    setFilters([{ field: "title", operator: "contains", value: val || undefined }], "merge")
  }

  const handleStatusFilter = (status: string) => {
    setFilters([{ field: "status", operator: "eq", value: status === "all" ? undefined : status }], "merge")
  }

  const handleUpsert = async (e: React.FormEvent<HTMLFormElement>, lotId?: string) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
        const res = await adminUpsertLot({
            ...data,
            event_id: eventId,
            images: uploadedImages
        }, lotId)
        
        if (res.error) {
            toast.error("SERVER ERROR: " + res.error)
        } else {
            toast.success(lotId ? "Item updated" : "Item added to catalog")
            await invalidate({ resource: "auctions", invalidates: ["list", "detail"] })
            setIsCreateOpen(false)
            setIsEditOpen(false)
            tableQuery?.refetch?.()
        }
    } catch (err: any) {
        toast.error("CRITICAL UI ERROR: " + err.message)
    } finally {
        setFormLoading(false)
    }
  }

  const handleEditClick = async (lotId: string) => {
    setSelectedId(lotId)
    setFetchingLot(true)
    setIsEditOpen(true)
    setEditLotData(null) // Reset previous data

    try {
        // Direct Supabase Fetch for Reliability
        const { data, error } = await supabase
            .from('auctions')
            .select('*, auction_images(*)')
            .eq('id', lotId)
            .single()

        if (error) throw error

        setEditLotData(data)
        
        // Prepare images for the upload component
        const currentImages = [
            ...(data.image_url ? [data.image_url] : []),
            ...(data.auction_images?.map((img: any) => img.url) || [])
        ].filter((v, i, a) => a.indexOf(v) === i)
        
        setUploadedImages(currentImages)

    } catch (err: any) {
        toast.error("Failed to load lot details: " + err.message)
        setIsEditOpen(false)
    } finally {
        setFetchingLot(false)
    }
  }

  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900 font-sans"
  const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block font-sans"

  if (isEventLoading) return <div className="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Event Registry...</div>

  return (
    <div className="space-y-8 font-sans text-zinc-900 pb-20">
      {/* Header Section: Full Width Title + Actions Row */}
      <div className="border-b border-zinc-100 pb-10">
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/events" className="p-2.5 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all text-zinc-400 shadow-sm"><ArrowLeft size={20} /></Link>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-zinc-900 leading-none">{event?.title || 'Auction Inventory'}</h1>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] bg-primary/5 px-3 py-1 rounded-full border border-primary/10">Global Inventory Pool</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">{total} Items Registered</span>
                </div>

                {/* Reorganized Dropdown Actions */}
                <div className="flex items-center gap-3 relative">
                    <button 
                        onClick={() => { setUploadedImages([]); setIsCreateOpen(true); }} 
                        className="bg-zinc-900 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2 hover:bg-primary"
                    >
                        <Plus size={16} strokeWidth={3} /> New Lot
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => setIsActionsOpen(!isActionsOpen)}
                            className={cn(
                                "p-3.5 rounded-2xl border-2 transition-all flex items-center gap-2 shadow-sm px-5",
                                isActionsOpen ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300"
                            )}
                        >
                            <Menu size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Event Actions</span>
                        </button>

                        {isActionsOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsActionsOpen(false)} />
                                <div className="absolute right-0 mt-3 w-72 bg-white border border-zinc-200 rounded-[32px] shadow-2xl z-50 overflow-hidden py-3 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-6 py-3 border-b border-zinc-50 mb-2">
                                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Administrative Protocols</p>
                                    </div>
                                    
                                    {/* Logistics Group */}
                                    <div className="px-3 space-y-1 mb-4">
                                        <button 
                                            onClick={() => { setIsPickupOpen(true); setIsActionsOpen(false); }}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-zinc-600 hover:bg-zinc-50 rounded-2xl transition-all group"
                                        >
                                            <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors"><Calendar size={16} /></div>
                                            <span className="text-[11px] font-bold uppercase tracking-tight">Manage Pickups</span>
                                        </button>
                                        <Link 
                                            href={`/admin/events/${eventId}/import`} 
                                            className="w-full flex items-center gap-4 px-4 py-3 text-zinc-600 hover:bg-zinc-50 rounded-2xl transition-all group"
                                        >
                                            <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors"><Save size={16} /></div>
                                            <span className="text-[11px] font-bold uppercase tracking-tight">ManyFastScan Sync</span>
                                        </Link>
                                    </div>

                                    <div className="px-6 py-3 border-b border-zinc-50 mb-2">
                                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Financial Operations</p>
                                    </div>

                                    {/* Financial Group */}
                                    <div className="px-3 space-y-1">
                                        <button 
                                            onClick={async () => {
                                                setIsActionsOpen(false);
                                                if (!confirm("Generate consolidated invoices for all winners?")) return;
                                                setFormLoading(true);
                                                const res = await generateEventInvoicesAction(eventId);
                                                if (res.success) toast.success(`${res.count} invoices generated!`);
                                                else toast.error(res.error);
                                                setFormLoading(false);
                                            }}
                                            disabled={formLoading}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all group"
                                        >
                                            <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all"><FileText size={16} /></div>
                                            <span className="text-[11px] font-bold uppercase tracking-tight">Generate Invoices</span>
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                setIsActionsOpen(false);
                                                if (!confirm("Release all uncaptured deposits?")) return;
                                                setFormLoading(true);
                                                const res = await releaseEventDeposits(eventId);
                                                if (res.success) toast.success(res.message);
                                                else toast.error(res.error);
                                                setFormLoading(false);
                                            }}
                                            disabled={formLoading}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-zinc-500 hover:bg-zinc-50 rounded-2xl transition-all group"
                                        >
                                            <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-zinc-900 group-hover:text-white transition-all"><Unlock size={16} /></div>
                                            <span className="text-[11px] font-bold uppercase tracking-tight">Release Deposits</span>
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                setIsActionsOpen(false);
                                                setFormLoading(true);
                                                try {
                                                    const { error } = await supabase.rpc('check_and_close_auctions');
                                                    if (error) throw error;
                                                    toast.success("Closing sequence executed");
                                                    tableQuery?.refetch?.();
                                                } catch (err: any) {
                                                    toast.error("Execution failed: " + err.message);
                                                } finally {
                                                    setFormLoading(false);
                                                }
                                            }}
                                            disabled={formLoading}
                                            className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group"
                                        >
                                            <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all"><Zap size={16} /></div>
                                            <span className="text-[11px] font-bold uppercase tracking-tight">Force Close Event</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
                type="text" 
                placeholder="Search items..." 
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-none outline-none focus:ring-0 placeholder:text-zinc-400 bg-transparent text-zinc-900 font-sans"
            />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'live', 'sold', 'draft', 'ended'].map((s) => (
                <button
                    key={s}
                    onClick={() => handleStatusFilter(s)}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap font-sans",
                        (filters?.find((f: any) => f.field === "status")?.value === s || (s === 'all' && !filters?.find((f: any) => f.field === "status")?.value))
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-md" 
                        : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                    )}
                >
                    {s}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden text-zinc-900">
        <div className="overflow-x-auto text-zinc-900">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/20 text-[10px] uppercase tracking-widest font-sans italic">
                        <th className="px-8 py-4 w-24 text-center">Lot #</th>
                        <th className="px-8 py-4 w-24">Preview</th>
                        <th className="px-8 py-4 font-sans">Product Name</th>
                        <th className="px-8 py-4 font-sans text-center">Activity</th>
                        <th className="px-8 py-4 text-right font-sans">Valuation</th>
                        <th className="px-8 py-4 text-right font-sans">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-sans text-zinc-900">
                    {isLoadingLots ? (
                        <tr><td colSpan={6} className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Inventory...</td></tr>
                    ) : lots.map((lot: any) => {
                        const bidCount = lot.bids?.length || 0;
                        return (
                            <tr key={lot.id} className="hover:bg-zinc-50/50 transition-colors group">
                                <td className="px-8 py-4 font-black text-zinc-900 text-sm italic text-center">{lot.lot_number || '---'}</td>
                                <td className="px-8 py-4 font-sans">
                                    <div className="h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 flex items-center justify-center">
                                        {lot.image_url ? <img src={lot.image_url} className="h-full w-full object-cover" /> : <Package size={16} className="text-zinc-300" />}
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    {(() => {
                                        const isEnded = new Date(lot.ends_at) <= new Date();
                                        const displayStatus = isEnded && lot.status === 'live' ? 'ended' : lot.status;
                                        return (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900">{lot.title}</span>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border w-fit mt-1",
                                                    displayStatus === 'live' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    displayStatus === 'sold' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                    "bg-zinc-100 text-zinc-400 border-zinc-200"
                                                )}>
                                                    {displayStatus}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </td>
                                <td className="px-8 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Gavel size={14} className={cn(bidCount > 0 ? "text-primary" : "text-zinc-300")} />
                                        <span className={cn("text-xs font-bold", bidCount > 0 ? "text-zinc-900" : "text-zinc-400 italic")}>{bidCount}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 font-bold text-zinc-900 text-right tabular-nums italic text-base">${Number(lot.current_price).toLocaleString()}</td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all font-sans">
                                        <button onClick={() => show("auctions", lot.id)} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"><Eye size={16} /></button>
                                        <button onClick={() => handleEditClick(lot.id)} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => { if(confirm("Remove?")) deleteLot({ resource: "auctions", id: lot.id }) }} className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && setActivePage && (
        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-zinc-200 shadow-sm font-sans">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Inventory Page</span>
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

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Catalog New Item">
        <form onSubmit={(e) => handleUpsert(e)} className="p-8 space-y-6">
            <ImageUpload onUpload={setUploadedImages} defaultValues={[]} />
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1"><label className={labelClasses}>Lot #</label><input name="lot_number" type="number" className={inputClasses} placeholder="101" /></div>
                    <div className="col-span-3"><label className={labelClasses}>Product Title</label><input name="title" required className={inputClasses} /></div>
                </div>
                <div>
                    <label className={labelClasses}>Category</label>
                    <select name="category_id" className={inputClasses}>
                        <option value="">Select a category...</option>
                        {categoriesList.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div><label className={labelClasses}>Description</label><textarea name="description" rows={3} className={cn(inputClasses, "h-auto py-3 resize-none")} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Opening Bid ($)</label><input name="start_price" type="number" required className={inputClasses} /></div>
                    <div><label className={labelClasses}>Min. Increment ($)</label><input name="min_increment" type="number" defaultValue={100} className={inputClasses} /></div>
                </div>
            </div>
            <div className="flex justify-end pt-4"><button disabled={formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">{formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Add to Catalog</>}</button></div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Lot Details">
        {fetchingLot || !editLotData ? (
            <div className="p-20 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        ) : (
            <form onSubmit={(e) => handleUpsert(e, selectedLotId!)} className="p-8 space-y-6" key={selectedLotId}>
                <ImageUpload onUpload={setUploadedImages} defaultValues={uploadedImages} />
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1"><label className={labelClasses}>Lot #</label><input name="lot_number" type="number" defaultValue={editLotData.lot_number} className={inputClasses} /></div>
                        <div className="col-span-3"><label className={labelClasses}>Product Title</label><input name="title" defaultValue={editLotData.title} required className={inputClasses} /></div>
                    </div>
                    <div>
                        <label className={labelClasses}>Category</label>
                        <select name="category_id" defaultValue={editLotData.category_id} key={editLotData.category_id} className={inputClasses}>
                            <option value="">Select a category...</option>
                            {categoriesList.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div><label className={labelClasses}>Description</label><textarea name="description" defaultValue={editLotData.description} rows={3} className={cn(inputClasses, "h-auto py-3 resize-none")} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClasses}>Current Valuation ($)</label><input name="current_price" type="number" defaultValue={editLotData.current_price} required className={inputClasses} /></div>
                        <div><label className={labelClasses}>Start Price ($)</label><input name="start_price" type="number" defaultValue={editLotData.start_price} className={inputClasses} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClasses}>Min. Increment ($)</label><input name="min_increment" type="number" defaultValue={editLotData.min_increment} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Status</label>
                            <select name="status" defaultValue={editLotData.status} className={inputClasses}>
                                <option value="draft">Draft</option>
                                <option value="live">Live</option>
                                <option value="sold">Sold</option>
                                <option value="ended">Ended</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4 font-sans text-zinc-900"><button disabled={formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">{formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Update Item</>}</button></div>
            </form>
        )}
      </Modal>

      {/* PICKUP MANAGEMENT MODAL */}
      <Modal isOpen={isPickupOpen} onClose={() => setIsPickupOpen(false)} title="Manage Pickup Windows">
        <div className="p-8 space-y-8 font-sans">
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Current Configuration</p>
                    <p className="text-sm font-bold text-zinc-900">{pickupCount} Time Slots Generated</p>
                </div>
                {pickupCount > 0 && (
                    <button 
                        onClick={async () => {
                            if (confirm("Delete all existing pickup slots for this event?")) {
                                const res = await deleteEventPickupSlots(eventId)
                                if (res.success) toast.success("Slots cleared")
                                else toast.error(res.error)
                            }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault()
                setFormLoading(true)
                const fd = new FormData(e.currentTarget)
                const res = await generateEventPickupSlots({
                    eventId,
                    date: fd.get('date') as string,
                    startTime: fd.get('startTime') as string,
                    endTime: fd.get('endTime') as string,
                    intervalMinutes: Number(fd.get('interval')),
                    maxCapacity: Number(fd.get('capacity'))
                })
                if (res.success) {
                    toast.success(`${res.count} slots generated!`)
                    setIsPickupOpen(false)
                } else {
                    toast.error(res.error)
                }
                setFormLoading(false)
            }} className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 italic border-l-4 border-primary pl-3">Generate Automated Slots</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div><label className={labelClasses}>Pickup Date</label><input name="date" type="date" required className={inputClasses} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClasses}>Start Time</label><input name="startTime" type="time" defaultValue="09:00" required className={inputClasses} /></div>
                        <div><label className={labelClasses}>End Time</label><input name="endTime" type="time" defaultValue="17:00" required className={inputClasses} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Interval (mins)</label>
                            <select name="interval" className={inputClasses}>
                                <option value="15">15 Minutes</option>
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Capacity / Slot</label>
                            <input name="capacity" type="number" defaultValue={2} className={inputClasses} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button disabled={formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                        {formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Generate Sequence</>}
                    </button>
                </div>
            </form>
        </div>
      </Modal>
    </div>
  )
}
