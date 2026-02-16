'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (urls: string[]) => void
  defaultValues?: string[]
}

export const ImageUpload = ({ onUpload, defaultValues = [] }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(defaultValues)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const files = Array.from(e.target.files)
      const uploadedUrls: string[] = [...images]

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('auction-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('auction-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setImages(uploadedUrls)
      onUpload(uploadedUrls)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onUpload(newImages)
  }

  return (
    <div className="space-y-4 font-sans text-zinc-900">
      <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block font-sans">
        Asset Gallery (First image is main)
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 group bg-zinc-50">
            <img src={url} alt={`Upload ${index}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
            {index === 0 && (
                <div className="absolute top-2 left-2 bg-zinc-900 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                    Main
                </div>
            )}
          </div>
        ))}

        <label className={cn(
          "aspect-square rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all",
          uploading && "opacity-50 pointer-events-none"
        )}>
          {uploading ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <>
              <div className="bg-zinc-100 p-2 rounded-full mb-2">
                <Plus size={20} className="text-zinc-400" />
              </div>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center px-2">Add Photo</span>
            </>
          )}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </label>
      </div>
    </div>
  )
}
