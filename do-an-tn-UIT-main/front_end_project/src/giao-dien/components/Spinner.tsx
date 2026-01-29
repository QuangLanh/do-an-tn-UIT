/**
 * Spinner Component
 * Component loading spinner toàn màn hình
 */

export const Spinner = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary-600"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Đang tải...</p>
      </div>
    </div>
  )
}
