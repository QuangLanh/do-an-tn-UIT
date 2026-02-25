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

// Thời gian trễ tối thiểu trước khi hiển thị spinner toàn cục (ms)
const GLOBAL_LOADING_DELAY = 250;

// Kiểu mở rộng cho config để lưu thông tin loading
type LoadingAwareConfig = InternalAxiosRequestConfig & {
  _loadingTimeoutId?: number;
  _loadingStarted?: boolean;
  /** Nếu true, bỏ qua spinner global (dùng cho các request nền như badge, socket sync, ...) */
  skipGlobalLoading?: boolean;
};

// Request interceptor - Thêm JWT token vào header và bắt đầu loading
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const cfg = config as LoadingAwareConfig;

    // Đặt timer: chỉ bật spinner nếu request > GLOBAL_LOADING_DELAY
    // và không được đánh dấu skipGlobalLoading
    if (!cfg.skipGlobalLoading) {
      const { startLoading } = useLoadingStore.getState();
      const timeoutId = window.setTimeout(() => {
        startLoading();
        cfg._loadingStarted = true;
      }, GLOBAL_LOADING_DELAY);

      cfg._loadingTimeoutId = timeoutId;
    }

    const persistedState = localStorage.getItem('auth-storage');
    
    if (persistedState) {
      try {
        const authData = JSON.parse(persistedState);
        const token =
          authData?.state?.token ||
          authData?.state?.user?.token
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    
    return cfg;
  },
  (error: AxiosError) => {
    // Dừng loading khi có lỗi trong request thiết lập
    const { stopLoading } = useLoadingStore.getState();
    stopLoading();
    return Promise.reject(error);
  }
)

// Response interceptor - Xử lý errors và dừng loading
apiClient.interceptors.response.use(
  (response: any) => {
    const cfg = (response.config || {}) as LoadingAwareConfig;
    const { stopLoading } = useLoadingStore.getState();

    // Huỷ timer nếu chưa kịp bật loading
    if (cfg._loadingTimeoutId) {
      clearTimeout(cfg._loadingTimeoutId);
    }

    // Chỉ gọi stopLoading nếu đã từng startLoading cho request này
    if (cfg._loadingStarted) {
      stopLoading();
    }

    return response;
  },
  (error: AxiosError) => {
    const cfg = (error.config || {}) as LoadingAwareConfig;
    const { stopLoading } = useLoadingStore.getState();

    if (cfg && cfg._loadingTimeoutId) {
      clearTimeout(cfg._loadingTimeoutId);
    }
    if (cfg && cfg._loadingStarted) {
      stopLoading();
    }

    if (error.response) {
      // Server trả về error
      const { status, data } = error.response;
      const requestUrl = (error.config?.url || '').toLowerCase();

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

