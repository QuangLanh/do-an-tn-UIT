/**
 * Pagination Component
 * Component phân trang với item per page selector
 * ĐÃ SỬA LỖI: Thêm type="button" để ngăn submit form
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhanTrangProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  itemsPerPageOptions?: number[]
}

export const PhanTrang = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
}: PhanTrangProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = Number(e.target.value)
    onItemsPerPageChange(newItemsPerPage)
    // Reset về trang 1 khi thay đổi items per page
    onPageChange(1)
  }

  if (totalItems === 0) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Hiển thị:
        </label>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">mục mỗi trang</span>
      </div>

      {/* Page info and navigation */}
      <div className="flex items-center gap-4">
        {/* Page info */}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
          <span className="font-medium">{endItem}</span> trong tổng số{' '}
          <span className="font-medium">{totalItems}</span> mục
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {/* NÚT TRANG TRƯỚC */}
          <button
            type="button" // <--- QUAN TRỌNG: Thêm type="button"
            onClick={(e) => {
                e.preventDefault();
                handlePrevious();
            }}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border ${
              currentPage === 1
                ? 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } transition-colors`}
            aria-label="Trang trước"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Hiển thị trang đầu, trang cuối, trang hiện tại và các trang xung quanh
                if (page === 1 || page === totalPages) return true
                if (Math.abs(page - currentPage) <= 1) return true
                return false
              })
              .map((page, index, array) => {
                // Thêm ellipsis nếu có khoảng trống
                const showEllipsisBefore = index > 0 && page - array[index - 1] > 1
                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsisBefore && (
                      <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                    )}
                    {/* NÚT SỐ TRANG */}
                    <button
                      type="button" // <--- QUAN TRỌNG: Thêm type="button"
                      onClick={(e) => {
                          e.preventDefault();
                          onPageChange(page);
                      }}
                      className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                )
              })}
          </div>

          {/* NÚT TRANG SAU */}
          <button
            type="button" // <--- QUAN TRỌNG: Thêm type="button"
            onClick={(e) => {
                e.preventDefault();
                handleNext();
            }}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border ${
              currentPage === totalPages
                ? 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } transition-colors`}
            aria-label="Trang sau"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}