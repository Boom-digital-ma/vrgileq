'use client'

import { useForm, useSelect, useNavigation } from "@refinedev/core"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export const AuctionCreate = () => {
  const { list } = useNavigation()
  const { onFinish, formLoading } = useForm({
    action: "create",
    resource: "auctions",
    redirect: "list"
  })

  const { options: categoryOptions } = useSelect({ resource: "categories" })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    onFinish({
      ...data,
      start_price: Number(data.start_price),
      current_price: Number(data.start_price),
      min_increment: Number(data.min_increment),
      status: "draft"
    })
  }

  const inputClasses = "w-full border border-zinc-200 p-3 rounded-lg text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-zinc-900 placeholder:text-zinc-300 shadow-sm"
  const labelClasses = "block text-xs font-semibold text-zinc-500 mb-1.5"

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => list("auctions")} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create New Lot</h1>
            <p className="text-sm text-zinc-500">Setup a new product for the next auction cycle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 p-8 rounded-xl shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2">
                <label className={labelClasses}>Product Title</label>
                <input name="title" type="text" required className={inputClasses} placeholder="Brand, Model, and Key Feature" />
            </div>

            <div className="md:col-span-2">
                <label className={labelClasses}>Detailed Description</label>
                <textarea name="description" rows={4} className={cn(inputClasses, "resize-none")} placeholder="Include condition, specs, and removal info..."></textarea>
            </div>

            <div>
                <label className={labelClasses}>Category</label>
                <select name="category_id" required className={inputClasses}>
                    <option value="">Select a category</option>
                    {categoryOptions?.map(opt => (
                        <option key={opt.value} value={opt.value}>{String(opt.label)}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelClasses}>Auction End Date & Time</label>
                <input name="ends_at" type="datetime-local" required className={inputClasses} />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-zinc-50/50 rounded-xl border border-zinc-100 mt-2">
                <div>
                    <label className={labelClasses}>Starting Price (USD)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                        <input name="start_price" type="number" step="0.01" required className={cn(inputClasses, "pl-8")} placeholder="0.00" />
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Minimum Bid Increment (USD)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                        <input name="min_increment" type="number" step="0.01" defaultValue="100" required className={cn(inputClasses, "pl-8")} />
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button 
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/10 active:scale-95 disabled:opacity-50"
            >
                {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Publish Lot to Inventory
            </button>
        </div>
      </form>
    </div>
  )
}
