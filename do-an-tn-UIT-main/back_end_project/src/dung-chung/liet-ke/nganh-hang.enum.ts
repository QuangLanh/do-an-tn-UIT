/**
 * Ngành hàng của cửa hàng.
 *
 * Dùng để bật/tắt tính năng và đổi thuật ngữ theo ngành. Lõi hệ thống (sản phẩm,
 * đơn hàng, nhập hàng, công nợ) phải dùng chung cho mọi ngành; chỉ phần đặc thù
 * mới rẽ theo giá trị này — ví dụ hạn sử dụng và quản lý lô chỉ có ý nghĩa với
 * tạp hóa, còn vật liệu xây dựng cần đơn vị quy đổi và công nợ nhà thầu.
 */
export enum NganhHang {
  TAP_HOA = 'tap-hoa',
  VAT_LIEU_XAY_DUNG = 'vat-lieu-xay-dung',
}

/** Gói cước của cửa hàng — phục vụ giai đoạn thương mại hóa. */
export enum GoiCuoc {
  DUNG_THU = 'dung-thu',
  CO_BAN = 'co-ban',
  NANG_CAO = 'nang-cao',
}
