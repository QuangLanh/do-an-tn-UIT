export enum TrangThaiDonHang {
  PENDING = 'pending',           // Chờ xử lý
  CONFIRMED = 'confirmed',       // Đã xác nhận
  PROCESSING = 'processing',     // Đang xử lý
  SHIPPING = 'shipping',         // Đang vận chuyển
  DELIVERED = 'delivered',       // Đã giao hàng
  COMPLETED = 'completed',       // Hoàn thành
  CANCELLED = 'cancelled',       // Đã hủy
}

