// src/ha-tang/api/supplierApi.ts
import { apiClient } from './index';
import { Supplier, CreateSupplierDto } from '@/linh-vuc/suppliers/entities/Supplier';

export const supplierApi = {
  // Lấy tất cả
  getAll: {
    execute: async (): Promise<Supplier[]> => {
      // 👇 THỬ 1: Thêm cứng chữ /api/ vào để chắc chắn trúng
      const response = await apiClient.get('suppliers');
      return response.data;
    }
  },

  // Tạo mới
  create: {
    execute: async (data: CreateSupplierDto): Promise<Supplier> => {
      // 👇 THỬ 1: Thêm cứng chữ /api/ vào
      const response = await apiClient.post('suppliers', data);
      return response.data;
    }
  },

  // Cập nhật
  update: {
    execute: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
      const response = await apiClient.patch(`suppliers/${id}`, data);
      return response.data;
    }
  },

  // Xóa
  delete: {
    execute: async (id: string): Promise<void> => {
      await apiClient.delete(`suppliers/${id}`);
    }
  }
};