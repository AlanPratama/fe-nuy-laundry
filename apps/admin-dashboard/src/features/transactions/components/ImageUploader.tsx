import React, { useRef } from 'react'
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'

interface Props {
  label: string
  sublabel?: string
  images: string[]
  onAddImage?: (url: string) => void
  onAddFiles?: (files: File[]) => void
  onRemoveImage: (index: number) => void
  disabled?: boolean
}

export const ImageUploader: React.FC<Props> = ({
  label,
  sublabel,
  images,
  onAddImage,
  onAddFiles,
  onRemoveImage,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    if (onAddFiles) {
      onAddFiles(fileList)
    }

    fileList.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result && onAddImage) {
          onAddImage(uploadEvent.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider">
            {label}
          </label>
          {sublabel && <p className="text-[11px] text-ink-soft">{sublabel}</p>}
        </div>
        <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
          {images.length} Foto
        </span>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="group relative aspect-square rounded-2xl overflow-hidden border border-brand-100 bg-brand-50/50 shadow-sm"
          >
            <img 
              src={resolveImageUrl(img)} 
              alt={`Dokumentasi ${idx + 1}`} 
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition shadow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Upload Dropzone Button */}
        {!disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-600 hover:bg-brand-50/40 transition flex flex-col items-center justify-center p-3 text-center group"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 grid place-items-center mb-1.5 group-hover:bg-brand-600 group-hover:text-white transition">
              <UploadCloud className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-brand-600">Unggah Foto</span>
            <span className="text-[10px] text-ink-soft">JPG, PNG (Maks 5MB)</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
