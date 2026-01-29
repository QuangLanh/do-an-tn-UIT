// src/linh-vuc/suppliers/entities/Supplier.ts

export interface Supplier {
  id: string;
  code: string;        // Mã quản lý (NCC001)
  name: string;        // Tên nhà cung cấp
  phone: string;       // Số điện thoại
  address?: string;    // Địa chỉ (không bắt buộc)
  email?: string;      // Email (không bắt buộc)
  contactPerson?: string; // Người liên hệ
  note?: string;       // Ghi chú
  isActive: boolean;   // Trạng thái hoạt động
}

// DTO dùng khi tạo mới (thường không có ID)
export type CreateSupplierDto = Omit<Supplier, 'id' | 'code' | 'isActive'>;