/**
 * API Client - Axios Configuration
 * Centralized API client với authentication và error handling
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useLoadingStore } from '@/kho-trang-thai/khoTai';

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

// Request interceptor - Thêm JWT token vào header và bắt đầu loading
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Bắt đầu loading
    const { startLoading } = useLoadingStore.getState()
    startLoading()

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
    // Dừng loading khi có lỗi trong request
    const { stopLoading } = useLoadingStore.getState()
    stopLoading()
    return Promise.reject(error)
  }
)

// Response interceptor - Xử lý errors và dừng loading
apiClient.interceptors.response.use(
  (response: any) => {
    // Dừng loading khi request thành công
    const { stopLoading } = useLoadingStore.getState()
    stopLoading()
    return response
  },
  (error: AxiosError) => {
    // Dừng loading khi có lỗi
    const { stopLoading } = useLoadingStore.getState()
    stopLoading()

    if (error.response) {
      // Server trả về error
      const { status, data } = error.response
      const requestUrl = (error.config?.url || '').toLowerCase()

      if (status === 401) {
        // Không redirect khi 401 từ chính request đăng nhập (tránh refresh trang khi sai mật khẩu / tài khoản khóa)
        const isLoginRequest = requestUrl.includes('/auth/login') || requestUrl.includes('auth/login')
        if (!isLoginRequest) {
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
        }
      }

      // Throw error với message từ server (để trang đăng nhập hiển thị dưới nút)
      const errorMessage = (data as any)?.message || 'Có lỗi xảy ra'
      const err = error as any
      err.response = error.response
      return Promise.reject(err)
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

