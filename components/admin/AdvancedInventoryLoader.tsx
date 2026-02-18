'use client'

import { useState } from "react"
import { useShow, useInvalidate, useNavigation } from "@refinedev/core"
import { ArrowLeft, Save, Loader2, Plus, Image as ImageIcon, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { importLots } from "@/app/actions/lots"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { cn } from "@/lib/utils"

export const AdvancedInventoryLoader = () => {
  const params = useParams()
  const eventId = params?.id as string

  const { query } = useShow({ 
    resource: "auction_events",
    id: eventId 
  })
  const event = (query as any)?.data?.data
  const invalidate = useInvalidate()
  const { list } = useNavigation()
  const supabase = createClient()

  const [importLoading, setImportLoading] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, phase: "" })
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<{ excel: File | null, images: File[] }>({ excel: null, images: [] })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (!files) return

    if (name === 'excel') {
        setSelectedFiles(prev => ({ ...prev, excel: files[0] }))
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames.find(n => n === 'Worksheet') || wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)
            setPreviewData(data.slice(0, 5))
        }
        reader.readAsBinaryString(files[0])
    } else {
        setSelectedFiles(prev => ({ ...prev, images: Array.from(files) }))
    }
  }

  const startSync = async () => {
    if (!selectedFiles.excel) {
        toast.error("Please select an Excel or CSV file first.")
        return
    }
    if (!eventId) {
        toast.error("System Error: Event ID not found.")
        return
    }

    setImportLoading(true)
    try {
        // ... (previous logic)
        const data: any[] = await new Promise((resolve) => {
            if (selectedFiles.excel!.name.endsWith('.csv')) {
                Papa.parse(selectedFiles.excel!, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data)
                })
            } else {
                const reader = new FileReader()
                reader.onload = (evt) => {
                    const bstr = evt.target?.result
                    const wb = XLSX.read(bstr, { type: 'binary' })
                    const wsname = wb.SheetNames.find(n => n === 'Worksheet') || wb.SheetNames[0]
                    const ws = wb.Sheets[wsname]
                    resolve(XLSX.utils.sheet_to_json(ws))
                }
                reader.readAsBinaryString(selectedFiles.excel!)
            }
        })

        setImportProgress({ current: 0, total: selectedFiles.images.length, phase: "Syncing assets (checking existence)..." })
        const imageUrlMap: Record<string, string[]> = {}
        const folderCache: Record<string, string[]> = {}

        for (const file of selectedFiles.images) {
            const lotNumMatch = file.name.match(/^(\d+)-/)
            if (!lotNumMatch) continue
            
            const lotNum = lotNumMatch[1]
            const folderPath = `${eventId}/${lotNum}`
            const filePath = `${folderPath}/${file.name}`

            if (!folderCache[folderPath]) {
                const { data: existingFiles } = await supabase.storage.from('auction-images').list(folderPath)
                folderCache[folderPath] = existingFiles?.map(f => f.name) || []
            }

            const exists = folderCache[folderPath].includes(file.name)

            if (!exists) {
                const { error: uploadError } = await supabase.storage
                    .from('auction-images')
                    .upload(filePath, file, { upsert: true })

                if (uploadError) {
                    console.error(`UPLOAD ERROR for ${file.name}:`, uploadError)
                }
            }
            
            const { data: { publicUrl } } = supabase.storage.from('auction-images').getPublicUrl(filePath)
            if (!imageUrlMap[lotNum]) imageUrlMap[lotNum] = []
            imageUrlMap[lotNum].push(publicUrl)
            
            setImportProgress(prev => ({ ...prev, current: prev.current + 1 }))
        }

        setImportProgress({ current: 0, total: 0, phase: "Creating database records..." })
        const finalLots = data.map(row => {
            const lotNum = String(row['lot'] || row['Lot #'] || row['lot_number'] || '')
            
            const core = {
                lot_number: lotNum ? parseInt(lotNum) : null,
                title: row['name'] || row['Title'] || row['title'] || row['Name'] || `Lot #${lotNum}`,
                description: row['description'] || row['Description'] || '',
                start_price: row['minimum_starting_bid'] || row['Opening Bid'] || row['Price'] || row['start_price'] || 0,
                manufacturer: row['manufacturer'] || null,
                model: row['model'] || null,
                image_url: imageUrlMap[lotNum]?.[0] || null,
                all_images: imageUrlMap[lotNum] || []
            }

            const metadata: Record<string, any> = {}
            Object.keys(row).forEach(key => {
                if (!['lot', 'Lot #', 'lot_number', 'name', 'Title', 'title', 'Name', 'description', 'Description', 'minimum_starting_bid', 'Opening Bid', 'Price', 'start_price', 'manufacturer', 'model'].includes(key)) {
                    metadata[key] = row[key]
                }
            })

            return { ...core, metadata }
        })

        const res = await importLots(eventId, finalLots)
        if (res.success) {
            toast.success(`${res.count} lots imported successfully.`)
            invalidate({ resource: "auctions", invalidates: ["list"] })
            list("auction_events")
        } else {
            throw new Error(res.error)
        }

    } catch (err: any) {
        toast.error("CRITICAL SYNC ERROR: " + err.message)
    } finally {
        setImportLoading(false)
    }
  }

  const inputClasses = "w-full h-14 bg-white border-2 border-zinc-100 rounded-2xl px-6 text-sm outline-none focus:border-primary transition-all font-bold text-zinc-900 cursor-pointer file:hidden flex items-center justify-center"

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10 font-sans">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-10">
        <div className="flex items-center gap-6">
            <Link href={`/admin/events/${eventId}`} className="p-4 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400 border border-zinc-100"><ArrowLeft size={24} /></Link>
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">ManyFastScan Sync</h1>
                <p className="text-xs font-black uppercase tracking-widest text-primary">Target: {event?.title || "Loading..."}</p>
            </div>
        </div>
        {!importLoading && (
            <button 
                onClick={startSync}
                disabled={!selectedFiles.excel}
                className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-primary transition-all active:scale-95 disabled:opacity-20"
            >
                Push to Live Server
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white border-2 border-zinc-100 rounded-[40px] p-10 space-y-8">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl"><FileSpreadsheet className="text-primary" /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">1. Inventory Sheet</h3>
            </div>
            
            <div className="relative">
                <input name="excel" type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className={inputClasses} />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] font-black uppercase text-zinc-400">
                    {selectedFiles.excel ? selectedFiles.excel.name : "Select Excel/CSV Export"}
                </div>
            </div>

            {previewData && (
                <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-zinc-300">Data Preview (First 5)</span>
                    <div className="border-2 border-zinc-50 rounded-2xl overflow-hidden">
                        {previewData.map((row, i) => {
                            const lotNum = row['lot'] || row['Lot #'] || row['lot_number'] || '??';
                            const title = row['name'] || row['Title'] || row['title'] || row['Name'] || 'No Title';
                            return (
                                <div key={i} className="px-4 py-2 text-[9px] border-b border-zinc-50 last:border-0 font-bold text-zinc-500 uppercase">
                                    #{lotNum} - {title}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        <div className="bg-white border-2 border-zinc-100 rounded-[40px] p-10 space-y-8">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl"><ImageIcon className="text-primary" /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">2. High-Res Assets</h3>
            </div>

            <div className="relative">
                <input name="images" type="file" multiple accept="image/*" onChange={handleFileChange} className={inputClasses} />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[10px] font-black uppercase text-zinc-400">
                    {selectedFiles.images.length > 0 ? `${selectedFiles.images.length} Images Selected` : "Select All Scan Photos"}
                </div>
            </div>

            <div className="bg-light/10 p-6 border-2 border-dashed border-zinc-100 rounded-3xl">
                <div className="flex items-center gap-3 text-zinc-400 italic">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-bold uppercase">Auto-Matching Protocol Active</span>
                </div>
                <p className="mt-2 text-[9px] text-zinc-400 leading-relaxed uppercase">The engine will pair files matching the pattern <code>[LotNum]-index.jpg</code> automatically.</p>
            </div>
        </div>
      </div>

      {importLoading && (
        <div className="bg-zinc-900 rounded-[40px] p-12 text-white space-y-8 animate-in fade-in zoom-in duration-500 shadow-2xl">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <h4 className="text-primary font-black uppercase tracking-[0.3em] text-xs">Sync in Progress</h4>
                    <p className="text-2xl font-black uppercase italic tracking-tighter">{importProgress.phase}</p>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black text-primary tabular-nums italic">
                        {importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%
                    </span>
                </div>
            </div>

            <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden border border-white/5 p-1">
                <div 
                    className="bg-primary h-full rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(4,154,158,0.5)]" 
                    style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                />
            </div>

            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                <span>Transmitting Data Blocks</span>
                <span>{importProgress.current} / {importProgress.total} Files Processed</span>
            </div>
        </div>
      )}

      {!importLoading && (
        <div className="flex items-center gap-4 p-8 border-4 border-primary/10 rounded-3xl italic">
            <AlertCircle className="text-primary shrink-0" size={32} />
            <div>
                <h4 className="text-xs font-black uppercase text-primary">Safety Protocol</h4>
                <p className="text-[10px] text-zinc-400 font-medium uppercase leading-relaxed">Ensure your Excel file follows the standardized ManyFastScan format. Uploading will overwrite existing assets with the same Lot Number for this event.</p>
            </div>
        </div>
      )}
    </div>
  )
}
