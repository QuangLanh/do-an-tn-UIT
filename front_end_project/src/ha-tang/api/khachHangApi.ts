/**
 * API Client - Axios Configuration
 * Centralized API client với authentication và error handling
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// API Base URL - có thể lấy từ env hoặc config
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Thêm JWT token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const persistedState = localStorage.getItem('auth-storage')
    
    if (persistedState) {
      try {
        const authData = JSON.parse(persistedState)
        const token =
          authData?.state?.token ||
          authData?.state?.user?.token
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Xử lý errors
apiClient.interceptors.response.use(
  (response: any) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server trả về error
      const { status, data } = error.response
      
      if (status === 401) {
        // Unauthorized - xóa token và redirect to login
        localStorage.removeItem('auth-storage')
        const isCustomerArea = window.location.pathname.startsWith('/khach-hang')
        window.location.href = isCustomerArea ? '/khach-hang/dang-nhap' : '/login'
      }
      
      // Throw error với message từ server
      const errorMessage = (data as any)?.message || 'Có lỗi xảy ra'
      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      // Request đã được gửi nhưng không có response
      return Promise.reject(new Error('Không thể kết nối đến server'))
    } else {
      // Lỗi khi setup request
      return Promise.reject(error)
    }
  }
)

export default apiClient

