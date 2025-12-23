/**
 * Image Upload Component
 * Component upload và preview ảnh
 */

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface UploadAnhProps {
  label?: string
  value?: string // URL hoặc base64
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export const UploadAnh = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
}: UploadAnhProps) => {
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    // Read file as base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setPreview(base64String)
      onChange(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-2">
        {/* Preview */}
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors bg-gray-50 dark:bg-gray-800"
          >
            <ImageIcon size={48} className="text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click để chọn ảnh hoặc kéo thả ảnh vào đây
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              PNG, JPG, GIF tối đa 5MB
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload button */}
        {!preview && (
          <button
            type="button"
            onClick={handleClick}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            <span>Chọn ảnh</span>
          </button>
        )}
      </div>
    </div>
  )
}

