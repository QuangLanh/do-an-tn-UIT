import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Ngữ cảnh cửa hàng theo từng request.
 *
 * Mọi truy vấn tới các collection có gắn `pluginDaCuaHang` đều tự động bị lọc
 * theo `storeId` lấy từ đây, nên không ai phải nhớ thêm điều kiện lọc thủ công.
 *
 * Luồng thiết lập:
 *  1. `NguCanhCuaHangMiddleware` tạo ngữ cảnh cho mỗi request (kèm storeId suy ra
 *     từ header `X-Store-Code` nếu là endpoint công khai).
 *  2. `ChienLuocJwt` ghi đè `storeId` bằng giá trị trong token khi request có đăng nhập.
 *
 * Vì middleware chạy trước guard, đối tượng ngữ cảnh được tạo một lần rồi sửa tại chỗ
 * (không thay thế) để mọi tầng phía sau cùng nhìn thấy một giá trị.
 */
export interface NguCanhCuaHang {
  /** ID cửa hàng hiện tại; null nghĩa là chưa xác định được. */
  storeId?: string | null;
  /** Mã cửa hàng lấy từ header/query của endpoint công khai. */
  maCuaHang?: string | null;
  /** Khi true, plugin không chèn điều kiện lọc — chỉ dùng cho các thao tác toàn hệ thống. */
  boQuaLoc?: boolean;
}

const khoNguCanh = new AsyncLocalStorage<NguCanhCuaHang>();

/** Chạy một đoạn xử lý trong ngữ cảnh cửa hàng cho trước. */
export function chayTrongNguCanh<T>(nguCanh: NguCanhCuaHang, ham: () => T): T {
  return khoNguCanh.run(nguCanh, ham);
}

export function layNguCanh(): NguCanhCuaHang | undefined {
  return khoNguCanh.getStore();
}

export function layStoreIdHienTai(): string | null {
  return khoNguCanh.getStore()?.storeId ?? null;
}

/**
 * Ghi storeId vào ngữ cảnh đang chạy (sửa tại chỗ để guard đặt được giá trị
 * mà middleware đã khởi tạo trước đó).
 */
export function datStoreIdHienTai(storeId: string): void {
  const nguCanh = khoNguCanh.getStore();
  if (nguCanh) nguCanh.storeId = storeId;
}

export function boQuaLocHienTai(): boolean {
  return khoNguCanh.getStore()?.boQuaLoc === true;
}

/**
 * Chạy thao tác trên toàn hệ thống, không lọc theo cửa hàng.
 *
 * Chỉ dùng cho số ít trường hợp hợp lệ:
 *  - Đăng nhập (tìm người dùng theo email khi chưa biết cửa hàng)
 *  - Xác thực JWT (tìm người dùng / khách hàng theo id)
 *  - Script chuyển đổi dữ liệu và gieo dữ liệu mẫu
 *
 * Không dùng trong code nghiệp vụ thường ngày.
 */
export function chayBoQuaLoc<T>(ham: () => T): T {
  const hienTai = khoNguCanh.getStore();
  return khoNguCanh.run({ ...(hienTai ?? {}), boQuaLoc: true }, ham);
}
