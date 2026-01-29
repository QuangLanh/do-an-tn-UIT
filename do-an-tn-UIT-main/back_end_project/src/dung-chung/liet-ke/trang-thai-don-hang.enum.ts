/**
 * Trạng thái đơn hàng đặt online (thống nhất BE, FE admin, FE khách hàng)
 * Chỉ 4 trạng thái: pending, shipping, completed, cancelled
 */
export enum TrangThaiDonHang {
  PENDING = 'pending',     // Chờ xử lý
  SHIPPING = 'shipping',  // Đang vận chuyển
  COMPLETED = 'completed', // Hoàn thành
  CANCELLED = 'cancelled', // Đã hủy
}
