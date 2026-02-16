'use client'

import { useTable, useNavigation, useDelete, useForm } from "@refinedev/core"
import { Edit, Trash2, Plus, Loader2, Save, Search, Activity } from "lucide-react"
import { useState } from "react"
import { Modal, ConfirmModal } from "./Modal"

export const CategoryList = () => {
  const result = useTable({
    resource: "categories",
    pagination: { pageSize: 20 }
  })

  const tableQuery = (result as any).tableQuery;
  const categories = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { setFilters } = result
  const { mutate: deleteRecord } = useDelete()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const createForm = useForm({ resource: "categories", action: "create", onMutationSuccess: () => setIsCreateOpen(false) })
  const editForm = useForm({ resource: "categories", action: "edit", id: selectedId || undefined, onMutationSuccess: () => setIsEditOpen(false) })

  const handleSearch = (val: string) => {
    setFilters([{ field: "name", operator: "contains", value: val || undefined }], "replace")
  }

  const handleEditClick = (id: string) => {
    setSelectedId(id)
    setIsEditOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setIsDeleteOpen(true)
  }

  const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900"
  const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block"

  if (isLoading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <Activity className="h-10 w-10 text-primary animate-spin" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing with Refine v5...</p>
    </div>
  )

  return (
    <div className="space-y-6 text-zinc-900 font-sans">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Inventory Classification</p>
        </div>
        <button 
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm active:scale-95 transition-all hover:bg-zinc-800"
        >
            <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3">
        <Search className="text-zinc-400" size={18} />
        <input 
            type="text" 
            placeholder="Search categories by name..." 
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden font-sans">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-zinc-500 font-medium border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest italic">Category Name</th>
              <th className="px-6 py-4 font-semibold uppercase text-[10px] tracking-widest text-right italic font-sans">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {categories.map((cat: any) => (
              <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4 font-bold uppercase tracking-tight text-zinc-900">{cat.name}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(cat.id)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(cat.id)} className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all">
                        <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALES */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Category">
        <form onSubmit={(e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)); createForm.onFinish(d); }} className="p-8 space-y-6">
            <div className="font-sans text-zinc-900">
                <label className={labelClasses}>Category Name</label>
                <input name="name" required className={inputClasses} placeholder="e.g. Industrial Machinery" />
            </div>
            <div className="font-sans text-zinc-900">
                <label className={labelClasses}>URL Slug</label>
                <input name="slug" required className={inputClasses} placeholder="e.g. industrial-machinery" />
            </div>
            <div className="flex justify-end font-sans">
                <button disabled={createForm.formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    {createForm.formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Create Category</>}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Category">
        <form onSubmit={(e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.currentTarget)); editForm.onFinish(d); }} className="p-8 space-y-6">
            <div className="font-sans text-zinc-900">
                <label className={labelClasses}>Category Name</label>
                <input name="name" defaultValue={((editForm as any).queryResult as any)?.data?.data?.name} key={((editForm as any).queryResult as any)?.data?.data?.name} required className={inputClasses} />
            </div>
            <div className="flex justify-end font-sans">
                <button disabled={editForm.formLoading} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    {editForm.formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                </button>
            </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => deleteRecord({ resource: "categories", id: selectedId! })}
        title="Delete Category"
        message="Are you sure? This will affect all lots linked to this category."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
