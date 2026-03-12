/**
 * Trạng thái phiếu nhập hàng
 * - pending: Đã tạo phiếu nhưng chưa nhận hàng thực tế
 * - received: Đã nhận hàng và đã cập nhật tồn kho theo checklist
 * - cancelled: Đã hủy
 *
 * Ghi chú: giữ alias REQUESTING/COMPLETED để tương thích dữ liệu cũ.
 */
export enum TrangThaiNhapHang {
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',

  // Legacy aliases for backward compatibility
  REQUESTING = 'pending',
  COMPLETED = 'received',
}
