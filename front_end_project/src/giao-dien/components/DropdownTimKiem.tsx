/**
 * Searchable Dropdown Component
 * Component dropdown có thể tìm kiếm
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

interface DropdownTimKiemProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  required?: boolean
  allowCustom?: boolean // Cho phép nhập giá trị mới không có trong danh sách
  className?: string
}

export const DropdownTimKiem = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Chọn hoặc tìm kiếm...',
  required = false,
  allowCustom = true,
  className = '',
}: DropdownTimKiemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchQuery('')
  }

  const displayValue = value || placeholder

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            value
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{displayValue}</span>
            <div className="flex items-center space-x-2">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {allowCustom && searchQuery ? (
                    <button
                      type="button"
                      onClick={() => handleSelect(searchQuery)}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Thêm "{searchQuery}" mới
                    </button>
                  ) : (
                    'Không tìm thấy'
                  )}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      value === option
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}

              {/* Allow custom value if not found */}
              {allowCustom &&
                searchQuery &&
                !filteredOptions.includes(searchQuery) &&
                filteredOptions.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleSelect(searchQuery)}
                      className="w-full px-4 py-2 text-left text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      + Thêm "{searchQuery}" mới
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

