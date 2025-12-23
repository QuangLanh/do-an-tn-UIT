/**
 * User Entity
 * Người dùng và phân quyền
 */

export type UserRole = 'admin' | 'staff' | 'customer'

export interface User {
  id: string
  username?: string
  fullName?: string
  email?: string
  soDienThoai?: string
  role: UserRole
  avatar?: string
  createdAt?: Date
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface DangNhapKhachHangDuLieu {
  soDienThoai: string
  ten?: string
}

export interface AuthResponse {
  user: User
  token: string
}

