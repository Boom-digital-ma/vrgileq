'use client'

import { useForm, useNavigation } from "@refinedev/core"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

export default function CategoryEdit() {
  const { list } = useNavigation()
  const result = useForm({
    action: "edit",
    resource: "categories",
    redirect: "list"
  })
  const { onFinish, formLoading } = result
  const queryResult = (result as any).queryResult || (result as any).query

  const category = queryResult?.data?.data

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onFinish(Object.fromEntries(formData.entries()))
  }

  const inputClasses = "w-full border-2 border-primary p-4 font-bold text-sm focus:outline-none focus:bg-light/5 text-primary placeholder:text-neutral/20 uppercase tracking-widest transition-all"
  const labelClasses = "block text-[10px] font-black uppercase tracking-[0.2em] text-neutral/50 mb-2"

  if (queryResult?.isLoading) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest">Loading Category...</div>

  return (
    <div className="space-y-10 max-w-xl">
      <div className="flex items-center gap-6">
        <button onClick={() => list("categories")} className="p-3 border-2 border-primary hover:bg-primary hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
            <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-secondary">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-primary p-10 shadow-[16px_16px_0px_0px_rgba(11,43,83,1)] space-y-8">
        <div>
            <label className={labelClasses}>Category Name</label>
            <input name="name" type="text" defaultValue={category?.name} required className={inputClasses} />
        </div>
        <div>
            <label className={labelClasses}>Slug (URL Key)</label>
            <input name="slug" type="text" defaultValue={category?.slug} required className={inputClasses} />
        </div>
        <button disabled={formLoading} className="w-full flex items-center justify-center gap-3 bg-primary py-5 text-white font-black uppercase text-sm tracking-[0.2em] hover:bg-secondary transition-all shadow-[8px_8px_0px_0px_rgba(11,43,83,0.2)]">
            {formLoading ? <Loader2 className="animate-spin" /> : <Save className="h-5 w-5" />}
            Update Category
        </button>
      </form>
    </div>
  )
}
