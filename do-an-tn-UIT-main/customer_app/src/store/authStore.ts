import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { authApi } from '@/api/authApi'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (phone: string, name?: string) => Promise<void>
  requestOTP: (phone: string) => Promise<void>
  loginWithOTP: (phone: string, otp: string, name?: string) => Promise<void>
  loginWithPassword: (phone: string, password: string) => Promise<void>
  logout: () => void
  verifyToken: () => Promise<void>
  setPassword: (password: string) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      requestOTP: async (phone: string) => {
        set({ isLoading: true })
        try {
          // Validate phone number: must be exactly 10 digits starting with 0
          if (!/^0\d{9}$/.test(phone)) {
            toast.error('Số điện thoại phải có đúng 10 số và bắt đầu bằng 0')
            throw new Error('Invalid phone number')
          }
          const result = await authApi.requestOTP(phone)
          toast.success(result.message)
          // In development, show OTP in console/log
          if (result.otp) {
            console.log('OTP Code:', result.otp)
            toast(`Mã OTP (dev): ${result.otp}`, { duration: 10000 })
          }
        } catch (error: any) {
          toast.error(error.message || 'Không thể gửi mã OTP')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      loginWithOTP: async (phone: string, otp: string, name?: string) => {
        set({ isLoading: true })
        try {
          // Validate phone number
          if (!/^0\d{9}$/.test(phone)) {
            toast.error('Số điện thoại phải có đúng 10 số và bắt đầu bằng 0')
            throw new Error('Invalid phone number')
          }
          const { user, token } = await authApi.loginWithOTP(phone, otp, name)
          set({ user, token, isAuthenticated: true })
          toast.success(`Chào mừng ${user.name || phone}!`)
        } catch (error: any) {
          toast.error(error.message || 'Mã OTP không đúng hoặc đã hết hạn')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      loginWithPassword: async (phone: string, _password: string) => {
        // Backend doesn't have password login yet, use simple login instead
        return get().login(phone)
      },

      login: async (phone: string, name?: string) => {
        set({ isLoading: true })
        try {
          // Validate phone number
          if (!/^0\d{9}$/.test(phone)) {
            toast.error('Số điện thoại phải có đúng 10 số và bắt đầu bằng 0')
            throw new Error('Invalid phone number')
          }
          const { user, token } = await authApi.login(phone, name)
          set({ user, token, isAuthenticated: true })
          toast.success(`Chào mừng ${user.name || phone}!`)
        } catch (error: any) {
          toast.error(error.message || 'Đăng nhập thất bại')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        toast.success('Đã đăng xuất')
      },

      verifyToken: async () => {
        const { token } = get()
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }
        
        try {
          const user = await authApi.getCurrentUser()
          set({ user, isAuthenticated: true })
        } catch (error) {
          // Token invalid or expired
          set({ user: null, token: null, isAuthenticated: false })
        }
      },

      setPassword: async (password: string) => {
        set({ isLoading: true })
        try {
          await authApi.setPassword(password)
          toast.success('Đặt mật khẩu thành công')
        } catch (error: any) {
          toast.error(error.message || 'Không thể đặt mật khẩu')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        set({ isLoading: true })
        try {
          await authApi.changePassword(oldPassword, newPassword)
          toast.success('Đổi mật khẩu thành công')
        } catch (error: any) {
          toast.error(error.message || 'Không thể đổi mật khẩu')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true })
        try {
          const updatedUser = await authApi.updateProfile(data)
          set({ user: updatedUser })
          toast.success('Cập nhật thông tin thành công')
        } catch (error: any) {
          toast.error(error.message || 'Không thể cập nhật thông tin')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'customer-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
