/**
 * Authentication Store (Zustand)
 * Quản lý trạng thái đăng nhập và người dùng
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginCredentials } from '@/domains/users/entities/User'
import { RealAuthService } from '@/domains/users/services/RealAuthService'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const authService = new RealAuthService()

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
          const { user, token } = await authService.login(credentials)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({ user: null, token: null, isAuthenticated: false })
      },

      hasPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false

        switch (permission) {
          case 'delete_product':
            return authService.canDeleteProduct(user.role)
          case 'edit_product':
          case 'update_product':
            return authService.canEditProduct(user.role)
          case 'create_product':
            return authService.canCreateProduct(user.role)
          case 'view_reports':
            return authService.canViewReports(user.role)
          case 'export_reports':
            return authService.canExportReports(user.role)
          case 'create_order':
            return authService.canCreateOrder(user.role)
          case 'create_purchase':
            return authService.canCreatePurchase(user.role)
          case 'view_orders':
            return authService.canViewOrders(user.role)
          case 'view_purchases':
            return authService.canViewPurchases(user.role)
          case 'manage_users':
            return authService.canManageUsers(user.role)
          default:
            return false
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

