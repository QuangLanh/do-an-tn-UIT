/**
 * Trạng thái phiếu nhập hàng
 * - requesting: Đang yêu cầu (tạo từ gợi ý tồn kho, chờ NCC giao hàng)
 * - completed: Hoàn thành (đã nhận hàng, đã cập nhật tồn kho)
 * - cancelled: Đã hủy
 */
export enum TrangThaiNhapHang {
  REQUESTING = 'requesting', // Đang yêu cầu
  COMPLETED = 'completed',   // Hoàn thành
  CANCELLED = 'cancelled',   // Đã hủy
}
