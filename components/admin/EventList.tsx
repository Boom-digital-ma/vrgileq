'use client'

import { useTable, useNavigation, useDelete, useForm, useList } from "@refinedev/core"
import { Edit, Trash2, Plus, Loader2, Calendar, DollarSign, Eye, Save, Gavel } from "lucide-react"
import { cn, formatEventDate } from "@/lib/utils"
import { useState } from "react"
import { Modal, ConfirmModal } from "./Modal"
import { ImageUpload } from "./ImageUpload"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export const EventList = () => {
  const result = useTable({
    resource: "auction_events",
    pagination: { pageSize: 10 }
  })

  // Fetch global settings for dynamic default deposit
  const settingsResult = useList({ resource: "site_settings" })
  const settings = (settingsResult as any).query?.data?.data?.[0] || {}
  const globalDefaultDeposit = settings.default_deposit || 500

  const tableQuery = (result as any).tableQuery;
  const events = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { show } = useNavigation()
  const { mutate: deleteRecord } = useDelete()

  // --- ÉTATS DES MODALES ---
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false) // AJOUTÉ
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  // --- FORMULAIRES ---
  const createForm = useForm({ 
    resource: "auction_events", 
    action: "create", 
    onMutationSuccess: () => { setIsCreateOpen(false); setUploadedImages([]); } 
  })

  const editForm = useForm({
    resource: "auction_events",
    action: "edit",
    id: selectedId || undefined,
    onMutationSuccess: () => { setIsEditOpen(false); setUploadedImages([]); }
  })

  const editData = (editForm as any).queryResult?.data?.data || (editForm as any).query?.data?.data;

  const handleEditClick = (event: any) => {
    setSelectedId(event.id)
    setUploadedImages(event.image_url ? [event.image_url] : [])
    setIsEditOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setIsDeleteOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget))
    createForm.onFinish({
        ...d,
        image_url: uploadedImages.length > 0 ? uploadedImages[0] : null
    })
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = Object.fromEntries(new FormData(e.currentTarget))
    editForm.onFinish({
        ...d,
        image_url: uploadedImages.length > 0 ? uploadedImages[0] : null
    })
  }

  const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900 font-sans"
  const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block font-sans"

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" /></div>

  return (
    <div className="space-y-8 text-zinc-900 font-sans">
      <div className="flex justify-between items-end font-sans">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Auction Events</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Global sales administration</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={async () => {
                    const confirmClose = confirm("Execute closing sequence for all expired lots across all events?");
                    if (!confirmClose) return;
                    try {
                        const { error } = await createClient().rpc('check_and_close_auctions');
                        if (error) throw error;
                        toast.success("Global closing sequence executed");
                        tableQuery.refetch();
                    } catch (err: any) {
                        toast.error("Execution failed: " + err.message);
                    }
                }}
                className="bg-rose-50 text-rose-600 border border-rose-100 px-6 py-3 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 hover:bg-rose-100"
            >
                <Gavel size={16} /> Force Close Expired
            </button>
            <button onClick={() => { setUploadedImages([]); setIsCreateOpen(true); }} className="bg-zinc-900 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95">
                <Plus size={16} className="inline mr-2" /> Launch Event
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event: any) => (
          <div key={event.id} className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col text-zinc-900">
            <div className="aspect-[16/9] w-full bg-zinc-100 overflow-hidden border-b border-zinc-100">
                {event.image_url ? (
                    <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 uppercase font-black text-[10px] p-4 text-center italic">No Cover Image</div>
                )}
            </div>

            <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-4">
                    {(() => {
                        const isEnded = new Date(event.ends_at) <= new Date();
                        const displayStatus = isEnded && event.status === 'live' ? 'closed' : event.status;
                        
                        return (
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                displayStatus === 'live' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                                displayStatus === 'closed' ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" :
                                "bg-zinc-50 text-zinc-400 border-zinc-100"
                            )}>{displayStatus}</span>
                        );
                    })()}
                    <div className="flex gap-1">
                        <button onClick={() => handleEditClick(event)} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900"><Edit size={18} /></button>
                        <button onClick={() => show("auction_events", event.id)} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900"><Eye size={18} /></button>
                        <button onClick={() => handleDeleteClick(event.id)} className="p-2 hover:bg-rose-50 rounded-xl transition-colors text-zinc-300 hover:text-rose-600"><Trash2 size={18} /></button>
                    </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{event.title}</h2>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-6 font-medium italic leading-relaxed">{event.description}</p>

                <div className="space-y-3 border-t border-zinc-50 pt-6">
                    <div className="flex items-center gap-3 text-xs font-medium text-zinc-400 font-sans">
                        <Calendar size={14} />
                        <span>Closes: {formatEventDate(event.ends_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-zinc-400 font-sans">
                        <DollarSign size={14} />
                        <span>Hold: <span className="text-zinc-900 font-bold font-sans italic">${Number(event.deposit_amount).toLocaleString()}</span></span>
                    </div>
                </div>
            </div>
            
            <div className="bg-zinc-50 px-8 py-4 border-t border-zinc-100 flex justify-between items-center font-sans">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-sans italic">Management</span>
                <button onClick={() => show("auction_events", event.id)} className="text-[10px] font-black uppercase tracking-widest text-zinc-900 hover:underline font-sans italic">View Lots →</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Launch New Auction Event">
        <form onSubmit={handleCreateSubmit} className="p-8 space-y-6 font-sans">
            <ImageUpload onUpload={setUploadedImages} defaultValues={[]} />
            <div className="space-y-4">
                <div><label className={labelClasses}>Event Title</label><input name="title" required className={inputClasses} /></div>
                <div><label className={labelClasses}>Description</label><textarea name="description" rows={2} className={cn(inputClasses, "h-auto py-3 resize-none")} /></div>
                
                <div><label className={labelClasses}>Location</label><input name="location" placeholder="e.g. Alexandria, VA" className={inputClasses} /></div>

                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Start Date</label><input name="start_at" type="datetime-local" className={inputClasses} /></div>
                    <div><label className={labelClasses}>Closing Date</label><input name="ends_at" type="datetime-local" required className={inputClasses} /></div>
                </div>

                <div><label className={labelClasses}>Deposit ($)</label><input name="deposit_amount" type="number" defaultValue={globalDefaultDeposit} key={globalDefaultDeposit} className={inputClasses} /></div>
            </div>
            <div className="flex justify-end pt-4"><button disabled={createForm.formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">{createForm.formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Launch Sale</>}</button></div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Event Details">
        <form onSubmit={handleEditSubmit} className="p-8 space-y-6 font-sans text-zinc-900">
            <ImageUpload onUpload={setUploadedImages} defaultValues={uploadedImages} key={uploadedImages.join(',')} />
            <div className="space-y-4">
                <div><label className={labelClasses}>Event Title</label><input name="title" defaultValue={editData?.title} key={editData?.title} required className={inputClasses} /></div>
                <div><label className={labelClasses}>Description</label><textarea name="description" defaultValue={editData?.description} key={editData?.description} rows={2} className={cn(inputClasses, "h-auto py-3 resize-none")} /></div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Location</label><input name="location" defaultValue={editData?.location} key={editData?.location} placeholder="e.g. Alexandria, VA" className={inputClasses} /></div>
                    <div>
                        <label className={labelClasses}>Status</label>
                        <select name="status" defaultValue={editData?.status} key={editData?.status} className={inputClasses}>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="live">Live</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClasses}>Start Date</label><input name="start_at" type="datetime-local" defaultValue={editData?.start_at ? new Date(editData.start_at).toISOString().slice(0,16) : ''} key={editData?.start_at} className={inputClasses} /></div>
                    <div><label className={labelClasses}>End Date</label><input name="ends_at" type="datetime-local" defaultValue={editData?.ends_at ? new Date(editData.ends_at).toISOString().slice(0,16) : ''} key={editData?.ends_at} required className={inputClasses} /></div>
                </div>

                <div><label className={labelClasses}>Deposit Amount ($)</label><input name="deposit_amount" type="number" defaultValue={editData?.deposit_amount} key={editData?.deposit_amount} className={inputClasses} /></div>
            </div>
            <div className="flex justify-end pt-4 font-sans"><button disabled={editForm.formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">{editForm.formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Update Event</>}</button></div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => deleteRecord({ resource: "auction_events", id: selectedId! })}
        title="Cancel Sale Event"
        message="Are you sure? This action will remove the event registry entry."
        confirmText="Cancel Event"
        variant="danger"
      />
    </div>
  )
}
