/**
 * Utility functions for formatting
 * Các hàm tiện ích cho format dữ liệu
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/** Chỉ giữ chữ số, tối đa 10 ký tự (format SĐT Việt Nam). */
export const normalizePhoneInput = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  return digits.slice(0, 10)
}

/** Kiểm tra SĐT đúng format 10 số. */
export const isValidPhone10 = (value: string): boolean => {
  return /^0\d{9}$/.test(value.trim())
}

