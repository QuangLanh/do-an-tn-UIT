/**
 * Real Authentication Service - API Implementation
 * Sử dụng API thực từ backend thay vì mock users
 */

import { DangNhapKhachHangDuLieu, User, LoginCredentials, UserRole } from '../entities/User'
import { apiService } from '@/ha-tang/api'

/**
 * Map backend user response to frontend User entity
 */
function mapBackendToFrontend(backendUser: any): User {
  // Handle ObjectId from MongoDB (can be object or string)
  let userId = backendUser.id || backendUser._id || ''
  if (userId && typeof userId === 'object' && userId.toString) {
    userId = userId.toString()
  }

  return {
    id: String(userId),
    username: backendUser.email || backendUser.username || '',
    fullName: backendUser.fullName || backendUser.name || '',
    email: backendUser.email || '',
    role: mapBackendRoleToFrontend(backendUser.role),
    avatar: backendUser.avatar,
    createdAt: backendUser.createdAt ? new Date(backendUser.createdAt) : new Date(),
  }
}

/**
 * Map backend role to frontend role
 */
function mapBackendRoleToFrontend(backendRole: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    ADMIN: 'admin',
    STAFF: 'staff',
    CUSTOMER: 'customer',
    admin: 'admin',
    staff: 'staff',
  }
  return roleMap[backendRole] || 'staff'
}

export class RealAuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // Backend uses email, but frontend might use username
      // Map username to email if needed
      let email = credentials.username
      
      // If username doesn't contain @, try to map it to email
      if (!email.includes('@')) {
        const usernameMap: Record<string, string> = {
          admin: 'admin@taphoa.com',
          staff: 'staff@taphoa.com',
          employee: 'staff@taphoa.com',
        }
        email = usernameMap[email.toLowerCase()] || email
      }

      console.log('🔐 Attempting login with email:', email)

      const response = await apiService.auth.login({
        email,
        password: credentials.password,
      })

      console.log('✅ Login response received:', response)

      // Backend returns: { access_token, user: { id, email, fullName, role } }
      // apiService.post() already returns response.data, so response is the object directly
      if (!response) {
        throw new Error('Không nhận được phản hồi từ server')
      }

      if (!response.access_token && !response.token) {
        console.error('❌ No token in response:', response)
        throw new Error('Không nhận được token từ server')
      }

      if (!response.user) {
        console.error('❌ No user data in response:', response)
        throw new Error('Không nhận được thông tin người dùng từ server')
      }

      const user = mapBackendToFrontend(response.user)
      const token = response.access_token || response.token
      
      console.log('👤 Mapped user:', user)
      console.log('🔑 Token received:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')

      return { user, token }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      const errorMessage = error.message || error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
      throw new Error(errorMessage)
    }
  }

  async logout(): Promise<void> {
    try {
      // Nothing to do here for now; store handles state cleanup
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const response = await apiService.auth.getProfile()
      return mapBackendToFrontend(response)
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  hasPermission(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return roles.includes(userRole)
  }

  canDeleteProduct(userRole: UserRole): boolean {
    return userRole === 'admin'
  }

  canEditProduct(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'staff'
  }

  canCreateProduct(userRole: UserRole): boolean {
    return userRole === 'admin'
  }

  canViewReports(userRole: UserRole): boolean {
    return userRole === 'admin'
  }

  canExportReports(userRole: UserRole): boolean {
    return userRole === 'admin'
  }

  canCreateOrder(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'staff'
  }

  canCreatePurchase(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'staff'
  }

  canViewOrders(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'staff'
  }

  canViewPurchases(userRole: UserRole): boolean {
    return userRole === 'admin' || userRole === 'staff'
  }

  canManageUsers(userRole: UserRole): boolean {
    return userRole === 'admin'
  }

  /**
   * Đăng nhập khách hàng bằng số điện thoại
   * Backend: POST /auth/customer/login
   */
  async dangNhapKhachHang(
    duLieu: DangNhapKhachHangDuLieu,
  ): Promise<{ user: User; token: string }> {
    const response = await apiService.auth.customerLogin({
      soDienThoai: duLieu.soDienThoai,
      ten: duLieu.ten,
    })

    const token = (response as any).access_token || (response as any).token
    const customer = (response as any).customer

    if (!token || !customer) {
      throw new Error('Không nhận được dữ liệu đăng nhập khách hàng từ server')
    }

    const user: User = {
      id: String(customer.id || customer._id || ''),
      soDienThoai: customer.soDienThoai,
      fullName: customer.ten,
      role: 'customer',
      createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
    }

    return { user, token }
  }

  async layKhachHangHienTai(): Promise<User | null> {
    try {
      const me = await apiService.auth.customerMe()
      return {
        id: String((me as any).id || (me as any)._id || ''),
        soDienThoai: (me as any).soDienThoai,
        fullName: (me as any).ten,
        role: 'customer',
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error)
      return null
    }
  }
}

