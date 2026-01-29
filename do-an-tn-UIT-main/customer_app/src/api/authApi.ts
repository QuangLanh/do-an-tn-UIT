import apiClient from './client'
import { AuthResponse, User } from '@/types'

export const authApi = {
  // Login customer (simple phone-based login - backend creates customer if not exists)
  login: async (phone: string, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/customer/login', {
      soDienThoai: phone,
      ten: name
    })
    // Map backend response to frontend format
    const data = response.data
    return {
      user: {
        id: data.customer.id || data.customer._id,
        name: data.customer.ten || name || '',
        phone: data.customer.soDienThoai,
        role: 'customer' as const
      },
      token: data.access_token
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/customer/me')
    const data = response.data
    return {
      id: data.id || data._id || '',
      name: data.ten || data.name || '',
      phone: data.soDienThoai || data.phone || '',
      role: 'customer' as const,
      email: data.email,
      address: data.diaChi || data.address
    }
  },

  // Request OTP for phone number
  requestOTP: async (phone: string): Promise<{ message: string; otp?: string }> => {
    // Validate phone number: must be exactly 10 digits starting with 0
    const response = await apiClient.post('/auth/customer/request-otp', {
      phone
    })
    return response.data
  },

  // Login with OTP
  loginWithOTP: async (phone: string, otp: string, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/customer/verify-otp', {
      phone,
      otp,
      ten: name
    })
    // Map backend response to frontend format
    const data = response.data
    return {
      user: {
        id: data.customer.id || data.customer._id,
        name: data.customer.ten || name || '',
        phone: data.customer.soDienThoai,
        role: 'customer' as const
      },
      token: data.access_token
    }
  },

  loginWithPassword: async (_phone: string, _password: string): Promise<AuthResponse> => {
    throw new Error('Password login not yet implemented in backend')
  },

  changePassword: async (_oldPassword: string, _newPassword: string): Promise<{ message: string }> => {
    throw new Error('Change password not yet implemented in backend')
  },

  setPassword: async (_password: string): Promise<{ message: string }> => {
    throw new Error('Set password not yet implemented in backend')
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const payload: any = {}
    if (data.name !== undefined) payload.ten = data.name
    if (data.email !== undefined) payload.email = data.email || undefined
    if (data.address !== undefined) payload.diaChi = data.address || undefined

    const response = await apiClient.put('/auth/customer/profile', payload)
    const responseData = response.data
    return {
      id: responseData.id || responseData._id,
      name: responseData.ten || responseData.name || '',
      phone: responseData.soDienThoai || responseData.phone,
      role: 'customer' as const,
      email: responseData.email,
      address: responseData.diaChi || responseData.address,
    }
  },
}
