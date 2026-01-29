/**
 * Format số tiền sang định dạng VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format ngày tháng
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format ngày (không giờ)
 */
export const formatDateOnly = (date: string | Date): string => {
  const d = new Date(date)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/**
 * Trạng thái đơn hàng đặt online (thống nhất với BE và FE quản trị)
 * Chỉ 4 trạng thái: pending, shipping, completed, cancelled
 */
export const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ xử lý',
    shipping: 'Đang vận chuyển',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    // legacy / API
    cho_xac_nhan: 'Chờ xử lý',
    dang_van_chuyen: 'Đang vận chuyển',
    hoan_thanh: 'Hoàn thành',
    da_huy: 'Đã hủy',
  }
  return statusMap[status] ?? status
}

/**
 * Lấy màu cho trạng thái đơn hàng
 */
export const getOrderStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  const variantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    shipping: 'info',
    completed: 'success',
    cancelled: 'danger',
    cho_xac_nhan: 'warning',
    dang_van_chuyen: 'info',
    hoan_thanh: 'success',
    da_huy: 'danger',
  }
  return variantMap[status] ?? 'default'
}
