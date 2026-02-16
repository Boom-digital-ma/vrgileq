'use client'

import { useShow, useList, useNavigation, useDelete, useForm, useInvalidate } from "@refinedev/core"
import { ArrowLeft, Plus, Loader2, Package, Gavel, Trash2, Edit, Save, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Modal, ConfirmModal } from "./Modal"
import { ImageUpload } from "./ImageUpload"
import { adminUpsertLot } from "@/app/actions/lots"

export const EventShow = () => {
  const invalidate = useInvalidate() // Hook pour forcer le rafraîchissement
  
  const result = useShow({ resource: "auction_events" })
  const eventQuery = (result as any).query;
  const event = eventQuery?.data?.data;
  const isEventLoading = eventQuery?.isLoading;

  const lotsResult = useList({
    resource: "auctions",
    filters: [{ field: "event_id", operator: "eq", value: event?.id }],
    queryOptions: { enabled: !!event?.id },
    meta: { select: "*, auction_images(*), bids(id)" }
  })
  const lotsQuery = (lotsResult as any).query;
  const lots = lotsQuery?.data?.data || []

  const { show } = useNavigation()
  const { mutate: deleteLot } = useDelete()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedLotId, setSelectedId] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)

  const editForm = useForm({ 
    resource: "auctions", 
    action: "edit", 
    id: selectedLotId || undefined,
    queryOptions: { meta: { select: "*, auction_images(*)" } }
  })

  const editData = (editForm as any).queryResult?.data?.data || (editForm as any).query?.data?.data;

  const handleEditClick = (lot: any) => {
    setSelectedId(lot.id)
    const currentImages = [
        ...(lot.image_url ? [lot.image_url] : []),
        ...(lot.auction_images?.map((img: any) => img.url) || [])
    ].filter((v, i, a) => a.indexOf(v) === i)
    
    setUploadedImages(currentImages)
    setIsEditOpen(true)
  }

  const handleUpsert = async (e: React.FormEvent<HTMLFormElement>, lotId?: string) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
        const res = await adminUpsertLot({
            ...data,
            event_id: event?.id,
            images: uploadedImages
        }, lotId)
        
        if (res.error) {
            alert("SERVER ERROR: " + res.error)
        } else {
            // FORCER LE RAFRAÎCHISSEMENT DU CACHE
            await invalidate({
                resource: "auctions",
                invalidates: ["list", "detail"],
            })
            
            setIsCreateOpen(false)
            setIsEditOpen(false)
            
            // Re-fetch manuel de la liste locale
            // @ts-ignore
            lotsResult.tableQuery?.refetch?.()
        }
    } catch (err: any) {
        alert("CRITICAL UI ERROR: " + err.message)
    } finally {
        setFormLoading(false)
    }
  }

  const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900 font-sans"
  const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block font-sans"

  if (isEventLoading) return <div className="p-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Accessing Event Assets...</div>

  return (
    <div className="space-y-8 font-sans text-zinc-900 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-8 font-sans">
        <div className="flex items-center gap-4">
            <Link href="/admin/events" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"><ArrowLeft size={20} /></Link>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">{event?.title || 'Auction Inventory'}</h1>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest italic">Global Registry • {lots.length} Items</p>
            </div>
        </div>
        <button onClick={() => { setUploadedImages([]); setIsCreateOpen(true); }} className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all">
            <Plus size={16} className="inline mr-2" /> Catalog New Lot
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden text-zinc-900">
        <div className="overflow-x-auto text-zinc-900">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/20 text-[10px] uppercase tracking-widest font-sans italic">
                        <th className="px-8 py-4">Preview</th>
                        <th className="px-8 py-4 font-sans">Product Name</th>
                        <th className="px-8 py-4 font-sans">Activity</th>
                        <th className="px-8 py-4 text-right font-sans">Valuation</th>
                        <th className="px-8 py-4 text-right font-sans">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-sans text-zinc-900">
                    {lots.map((lot: any) => {
                        const bidCount = lot.bids?.length || 0;
                        return (
                            <tr key={lot.id} className="hover:bg-zinc-50/50 transition-colors group">
                                <td className="px-8 py-4 font-sans">
                                    <div className="h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 flex items-center justify-center">
                                        {lot.image_url ? (
                                            <img src={lot.image_url} className="h-full w-full object-cover" />
                                        ) : (
                                            <Package size={16} className="text-zinc-300" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-zinc-900">{lot.title}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status: {lot.status}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-2">
                                        <Gavel size={14} className={cn(bidCount > 0 ? "text-primary" : "text-zinc-300")} />
                                        <span className={cn(
                                            "text-xs font-bold",
                                            bidCount > 0 ? "text-zinc-900" : "text-zinc-400 italic"
                                        )}>
                                            {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-4 font-bold text-zinc-900 text-right tabular-nums italic text-base">${Number(lot.current_price).toLocaleString()}</td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all font-sans">
                                        <button onClick={() => show("auctions", lot.id)} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"><Eye size={16} /></button>
                                        <button onClick={() => handleEditClick(lot)} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"><Edit size={16} /></button>
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

      {/* MODALES (Garder identiques mais appeler handleUpsert) */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Catalog New Item">
        <form onSubmit={(e) => handleUpsert(e)} className="p-8 space-y-6">
            <ImageUpload onUpload={setUploadedImages} defaultValues={[]} />
            <div className="space-y-4 text-zinc-900">
                <div><label className={labelClasses}>Product Title</label><input name="title" required className={inputClasses} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Opening Bid ($)</label><input name="start_price" type="number" required className={inputClasses} /></div>
                    <div><label className={labelClasses}>Min. Increment ($)</label><input name="min_increment" type="number" defaultValue={100} className={inputClasses} /></div>
                </div>
            </div>
            <div className="flex justify-end pt-4"><button disabled={formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">{formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Add to Catalog</>}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Lot Details">
        <form onSubmit={(e) => handleUpsert(e, selectedLotId!)} className="p-8 space-y-6">
            <ImageUpload onUpload={setUploadedImages} defaultValues={uploadedImages} key={uploadedImages.join(',')} />
            <div className="space-y-4 text-zinc-900">
                <div><label className={labelClasses}>Product Title</label><input name="title" defaultValue={editData?.title} key={editData?.title} required className={inputClasses} /></div>
                <div><label className={labelClasses}>Current Valuation ($)</label><input name="current_price" type="number" defaultValue={editData?.current_price} key={editData?.current_price} required className={inputClasses} /></div>
            </div>
            <div className="flex justify-end pt-4 font-sans text-zinc-900"><button disabled={formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">{formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Update Item</>}</button></div>
        </form>
      </Modal>
    </div>
  )
}
