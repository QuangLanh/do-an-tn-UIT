/**
 * Cửa hàng đang xem.
 *
 * Web khách hàng phục vụ nhiều cửa hàng trên cùng một bản triển khai, nên mã cửa
 * hàng nằm ngay trên đường dẫn: `/s/tap-hoa-minh-anh/products/123`.
 *
 * Mã được đọc một lần khi tải trang rồi dùng làm `basename` của React Router —
 * nhờ vậy mọi đường dẫn nội bộ trong ứng dụng ("/cart", "/orders") giữ nguyên,
 * còn trình duyệt vẫn hiển thị đầy đủ tiền tố cửa hàng.
 */

const KHOA_LUU = 'customer-store-code'

let maCuaHang = ''

/** Đọc mã cửa hàng từ đường dẫn hiện tại, ví dụ /s/tap-hoa-minh-anh/cart. */
export function docMaCuaHangTuDuongDan(pathname: string = window.location.pathname): string {
  const khop = pathname.match(/^\/s\/([a-z0-9]+(?:-[a-z0-9]+)*)/i)
  return khop ? khop[1].toLowerCase() : ''
}

/**
 * Khởi tạo mã cửa hàng cho phiên làm việc.
 * Ưu tiên mã trên URL; nếu không có thì dùng mã đã lưu của lần truy cập trước.
 */
export function khoiTaoMaCuaHang(): string {
  const tuUrl = docMaCuaHangTuDuongDan()

  if (tuUrl) {
    maCuaHang = tuUrl
    try {
      localStorage.setItem(KHOA_LUU, tuUrl)
    } catch {
      // Trình duyệt chặn lưu trữ — vẫn chạy được trong phiên hiện tại
    }
    return maCuaHang
  }

  try {
    maCuaHang = localStorage.getItem(KHOA_LUU) || ''
  } catch {
    maCuaHang = ''
  }
  return maCuaHang
}

export function layMaCuaHang(): string {
  return maCuaHang
}

/** Tiền tố đường dẫn của cửa hàng, dùng làm basename cho React Router. */
export function layTienToDuongDan(): string {
  return maCuaHang ? `/s/${maCuaHang}` : '/'
}
