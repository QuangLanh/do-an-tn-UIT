import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token to header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const persistedState = localStorage.getItem('customer-auth-storage')
    
    if (persistedState) {
      try {
        const authData = JSON.parse(persistedState)
        const token = authData?.state?.token
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

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response: any) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('customer-auth-storage')
        window.location.href = '/login'
      }
      
      const errorMessage = (data as any)?.message || 'Có lỗi xảy ra'
      toast.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    } else if (error.request) {
      toast.error('Không thể kết nối đến server')
      return Promise.reject(new Error('Không thể kết nối đến server'))
    } else {
      return Promise.reject(error)
    }
  }
)

export default apiClient
