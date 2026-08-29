import apiClient from './client'

export interface ThongTinCuaHang {
  ma: string
  ten: string
  nganhHang: string
  diaChi?: string
  soDienThoai?: string
}

export const storeApi = {
  /** Thông tin công khai của cửa hàng theo mã trên URL — không cần đăng nhập. */
  layThongTinCongKhai: async (ma: string): Promise<ThongTinCuaHang> => {
    const response = await apiClient.get(`/stores/public/${encodeURIComponent(ma)}`, {
      // Cửa hàng chưa xác định nên bỏ qua toast lỗi mặc định, App tự xử lý
      skipErrorToast: true,
    } as any)
    return response.data
  },
}
