'use client'

import { useForm, useSelect, useNavigation } from "@refinedev/core"
import { ArrowLeft, Save, Loader2, Copy, AlertCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { duplicateLot } from "@/app/actions/lots"
import { toast } from "sonner"
import { useState } from "react"

export const AuctionEdit = () => {
  const { list, edit } = useNavigation()
  const [isDuplicating, setIsDuplicating] = useState(false)
  const result = useForm({
    action: "edit",
    resource: "auctions",
    redirect: "list"
  })
  const { onFinish, formLoading } = result
  const queryResult = (result as any).queryResult || (result as any).query

  const { options: categoryOptions } = useSelect({ resource: "categories" })
  const auction = queryResult?.data?.data

  const isClosed = auction?.status === 'sold' || auction?.status === 'ended'

  const handleDuplicate = async () => {
    if (!auction?.id) return
    setIsDuplicating(true)
    const res = await duplicateLot(auction.id)
    if (res.success) {
      toast.success("Lot duplicated as draft!")
      edit("auctions", res.id!)
    } else {
      toast.error(res.error || "Failed to duplicate")
    }
    setIsDuplicating(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isClosed) {
      toast.error("Closed lots cannot be edited directly. Please duplicate it instead.")
      return
    }
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    onFinish({
      ...data,
      current_price: Number(data.current_price),
      min_increment: Number(data.min_increment),
    })
  }

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  const inputClasses = "w-full border border-zinc-200 p-3 rounded-lg text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-zinc-900 placeholder:text-zinc-300 shadow-sm"
  const labelClasses = "block text-xs font-semibold text-zinc-500 mb-1.5"

  if (queryResult?.isLoading) return <div className="p-20 text-center animate-pulse font-bold text-zinc-400 uppercase tracking-widest">Loading Lot Data...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => list("auctions")} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Lot #{auction?.id?.slice(0,8)}</h1>
                    {isClosed && (
                        <span className="bg-zinc-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Archive</span>
                    )}
                </div>
                <p className="text-sm text-zinc-500">Update specifications, pricing or status</p>
            </div>
        </div>

        <button 
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
        >
            {isDuplicating ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}
            Duplicate as Draft
        </button>
      </div>

      {isClosed && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                  <AlertCircle size={24} />
              </div>
              <div>
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Locked Asset Protocol</h3>
                  <p className="text-xs text-amber-700/80 font-medium leading-relaxed mt-1 max-w-2xl">
                      This lot has already reached <span className="font-bold underline">Final Status ({auction?.status})</span>. Modifying historical records is restricted to maintain transactional integrity. To reuse this lot, use the <strong>Duplicate</strong> action above.
                  </p>
              </div>
          </div>
      )}

      <form onSubmit={handleSubmit} className={cn(
          "bg-white border border-zinc-200 p-8 rounded-xl shadow-sm space-y-8 transition-all",
          isClosed && "opacity-60 pointer-events-none grayscale-[0.5]"
      )}>
        <fieldset disabled={isClosed} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                    <label className={labelClasses}>Product Title</label>
                    <input name="title" type="text" defaultValue={auction?.title} required className={inputClasses} />
                </div>

                <div className="md:col-span-2">
                    <label className={labelClasses}>Detailed Description</label>
                    <textarea name="description" rows={4} defaultValue={auction?.description} className={cn(inputClasses, "resize-none")}></textarea>
                </div>

                <div>
                    <label className={labelClasses}>Status</label>
                    <select name="status" defaultValue={auction?.status} required className={cn(inputClasses, "bg-zinc-900 text-white")}>
                        <option value="draft">DRAFT</option>
                        <option value="live">LIVE</option>
                        <option value="ended">ENDED</option>
                        <option value="sold">SOLD</option>
                    </select>
                </div>

                <div>
                    <label className={labelClasses}>Category</label>
                    <select name="category_id" defaultValue={auction?.category_id} required className={inputClasses}>
                        {categoryOptions?.map(opt => (
                            <option key={opt.value} value={opt.value}>{String(opt.label)}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-zinc-50/50 rounded-xl border border-zinc-100 mt-2">
                    <div>
                        <label className={labelClasses}>Current Price (USD)</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                            <input name="current_price" type="number" step="0.01" defaultValue={auction?.current_price} required className={cn(inputClasses, "pl-8")} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>End Date & Time</label>
                        <input name="ends_at" type="datetime-local" defaultValue={formatDateForInput(auction?.ends_at)} required className={inputClasses} />
                    </div>
                </div>
            </div>

            {!isClosed && (
                <div className="pt-4 border-t border-zinc-100 flex justify-end">
                    <button 
                        type="submit"
                        disabled={formLoading}
                        className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Update Lot Information
                    </button>
                </div>
            )}
        </fieldset>
      </form>
    </div>
  )
}

