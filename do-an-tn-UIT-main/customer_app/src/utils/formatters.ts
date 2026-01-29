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
 * Lấy tên hiển thị cho trạng thái đơn hàng
 */
export const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang vận chuyển',
    delivered: 'Đã giao hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  }
  return statusMap[status] || status
}

/**
 * Lấy màu cho trạng thái đơn hàng
 */
export const getOrderStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  const variantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipping: 'info',
    delivered: 'success',
    completed: 'success',
    cancelled: 'danger',
  }
  return variantMap[status] || 'default'
}
