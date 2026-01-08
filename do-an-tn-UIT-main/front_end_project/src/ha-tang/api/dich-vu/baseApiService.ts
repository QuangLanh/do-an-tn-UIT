/**
 * Base API Service
 * Generic service với các method cơ bản để call API
 * Bọc bên ngoài nhiều tầng để tránh gọi API nhiều chỗ
 */

import apiClient from '../khachHangApi'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

export class BaseApiService {
  /**
   * Generic GET request
   */
  protected async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(url, config)
    return response.data
  }

  /**
   * Generic POST request
   */
  protected async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config)
    return response.data
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.patch(url, data, config)
    return response.data
  }

  /**
   * Generic PUT request
   */
  protected async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config)
    return response.data
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(url, config)
    return response.data
  }

  /**
   * Download file (PDF, Excel, etc.)
   */
  protected async downloadFile(
    url: string,
    filename?: string,
  ): Promise<void> {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

