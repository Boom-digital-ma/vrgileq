'use client'

import { useTable, useNavigation, useDelete, useForm, useCreateMany } from "@refinedev/core"
import { Edit, Trash2, Plus, Loader2, Save, Search, Activity, FileDown, Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { useState, useRef } from "react"
import { Modal, ConfirmModal } from "./Modal"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export const CategoryList = () => {
  const result = useTable({
    resource: "categories",
    pagination: { pageSize: 10 }
  })

  const tableQuery = (result as any).tableQuery;
  const categories = tableQuery?.data?.data || []
  const isLoading = tableQuery?.isLoading

  const { 
    setFilters,
    current,
    setCurrent,
    currentPage,
    setCurrentPage,
    pageCount
  } = result as any

  // Safety aliasing for Refine v5 inconsistencies
  const activePage = currentPage || current;
  const goToPage = setCurrentPage || setCurrent;

  const { mutate: deleteRecord } = useDelete()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const createForm = useForm({ resource: "categories", action: "create", onMutationSuccess: () => setIsCreateOpen(false) })
  const editForm = useForm({ resource: "categories", action: "edit", id: selectedId || undefined, onMutationSuccess: () => setIsEditOpen(false) })

  const { mutate: createMany, isLoading: isImporting } = useCreateMany() as any

  const slugify = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importData, setImportData] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportData(results.data)
        },
        error: (err) => {
            toast.error("CSV Parsing error: " + err.message)
        }
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)
            processImportData(data)
        }
        reader.readAsBinaryString(file)
    } else {
        toast.error("Unsupported file format. Please use CSV or Excel.")
    }
  }

  const processImportData = (data: any[]) => {
    const formatted = data
      .filter(row => row.name || row.Name || row.category || row.Category)
      .map(row => {
        const name = row.name || row.Name || row.category || row.Category
        const slug = row.slug || row.Slug || slugify(name)
        return { name, slug }
      })
    
    if (formatted.length === 0) {
        toast.error("No valid category names found in file.")
        return
    }
    setImportData(formatted)
  }

  const handleImportSubmit = () => {
    createMany({
      resource: "categories",
      values: importData,
      successNotification: () => ({
          message: `${importData.length} categories imported successfully`,
          type: "success"
      })
    }, {
      onSuccess: () => {
        setIsImportOpen(false)
        setImportData([])
        result.tableQuery.refetch()
      },
      onError: (err: any) => {
          toast.error("Import failed: " + err.message)
      }
    })
  }

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
    <div className="space-y-6 text-zinc-900 font-sans pb-20">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Category Registry</h1>
            <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px] italic">Global Inventory Mapping</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-600 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all hover:bg-zinc-50 italic"
            >
                <Upload size={16} /> Import Registry
            </button>
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all hover:bg-zinc-800 italic"
            >
                <Plus size={16} /> Manual Entry
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-3">
        <Search className="text-zinc-400" size={18} />
        <input 
            type="text" 
            placeholder="Search categories by name..." 
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent font-sans"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden font-sans">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-zinc-400 font-bold border-b border-zinc-100 bg-zinc-50/50 text-[10px] uppercase tracking-widest font-sans italic">
              <th className="px-8 py-5">Category Name</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {categories.map((cat: any) => (
              <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-8 py-6 font-bold uppercase tracking-tight text-zinc-900">{cat.name}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(cat.id)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(cat.id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[24px] border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Registry Page</span>
                <span className="text-xs font-black italic">{activePage} / {pageCount}</span>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    disabled={activePage === 1}
                    onClick={() => goToPage(activePage - 1)}
                    className="p-2.5 border border-zinc-100 rounded-xl hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400"
                >
                    <ArrowLeft size={18} />
                </button>
                <button 
                    disabled={activePage === pageCount}
                    onClick={() => goToPage(activePage + 1)}
                    className="p-2.5 border border-zinc-100 rounded-xl hover:bg-zinc-50 disabled:opacity-20 transition-all text-zinc-400 rotate-180"
                >
                    <ArrowLeft size={18} />
                </button>
            </div>
        </div>
      )}

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

      {/* Import Modal */}
      <Modal isOpen={isImportOpen} onClose={() => { setIsImportOpen(false); setImportData([]); }} title="Import Registry" maxWidth="max-w-2xl">
        <div className="p-8 space-y-8 font-sans">
            {!importData.length ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 rounded-[32px] p-16 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-zinc-50 transition-all cursor-pointer group"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".csv,.xlsx,.xls" 
                        className="hidden" 
                    />
                    <div className="h-20 w-20 bg-zinc-900 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <FileDown className="text-white" size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-zinc-900">Drop Inventory File</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 italic">Supports .CSV, .XLSX, .XLS</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 leading-none">Mapping Successful</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic mt-1">{importData.length} records detected</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setImportData([])}
                            className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 italic"
                        >
                            Reset File
                        </button>
                    </div>

                    <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-zinc-100/50 border-b border-zinc-100 sticky top-0">
                                <tr>
                                    <th className="px-5 py-3 font-black uppercase tracking-widest text-zinc-500 italic">Category Name</th>
                                    <th className="px-5 py-3 font-black uppercase tracking-widest text-zinc-500 italic">Generated Slug</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {importData.map((row, i) => (
                                    <tr key={i} className="hover:bg-white transition-colors">
                                        <td className="px-5 py-3 font-bold text-zinc-900 uppercase">{row.name}</td>
                                        <td className="px-5 py-3 font-mono text-zinc-400 lowercase">{row.slug}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-zinc-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium italic mb-6">
                                The platform will automatically map the names and generate clean URL slugs for the store hierarchy.
                            </p>
                            <button 
                                onClick={handleImportSubmit}
                                disabled={isImporting}
                                className="w-full bg-white text-zinc-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/20"
                            >
                                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <><Upload size={18} /> Provision Inventory</>}
                            </button>
                        </div>
                        <div className="absolute -top-10 -right-10 h-64 w-64 bg-white/5 blur-3xl rounded-full"></div>
                    </div>
                </div>
            )}

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start gap-3">
                <AlertCircle className="text-zinc-400 shrink-0" size={16} />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic leading-relaxed">
                    Ensure your file has a header named <span className="text-zinc-900">"Name"</span> or <span className="text-zinc-900">"Category"</span>. 
                    Slugs are optional and will be generated automatically if missing.
                </p>
            </div>
        </div>
      </Modal>
    </div>
  )
}
