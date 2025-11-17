/**
 * Centralized API Service
 * Wrapper chính để call tất cả API
 * UI chỉ cần gọi method này, không cần biết URL hay chi tiết
 */

import { BaseApiService } from './baseApiService'
import { API_ENDPOINTS } from '../cau-hinh/apiEndpoints'

export class ApiService extends BaseApiService {
  // ==================== AUTH ====================
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.post(API_ENDPOINTS.auth.login(), credentials),

    register: (userData: any) =>
      this.post(API_ENDPOINTS.auth.register(), userData),

    getProfile: () => this.get(API_ENDPOINTS.auth.profile()),
  }

  // ==================== USERS ====================
  users = {
    list: () => this.get(API_ENDPOINTS.users.list()),

    detail: (id: string) => this.get(API_ENDPOINTS.users.detail(id)),

    create: (userData: any) =>
      this.post(API_ENDPOINTS.users.create(), userData),

    update: (id: string, userData: any) =>
      this.patch(API_ENDPOINTS.users.update(id), userData),

    delete: (id: string) => this.delete(API_ENDPOINTS.users.delete(id)),
  }

  // ==================== PRODUCTS ====================
  products = {
    list: (params?: { category?: string; search?: string; lowStock?: boolean }) =>
      this.get(API_ENDPOINTS.products.list(params)),

    detail: (id: string) => this.get(API_ENDPOINTS.products.detail(id)),

    create: (productData: any) =>
      this.post(API_ENDPOINTS.products.create(), productData),

    update: (id: string, productData: any) =>
      this.patch(API_ENDPOINTS.products.update(id), productData),

    delete: (id: string) => this.delete(API_ENDPOINTS.products.delete(id)),

    updateStock: (id: string, stockData: { operation: string; quantity: number }) =>
      this.patch(API_ENDPOINTS.products.updateStock(id), stockData),

    lowStock: () => this.get(API_ENDPOINTS.products.lowStock()),

    categories: () => this.get(API_ENDPOINTS.products.categories()),
  }

  // ==================== ORDERS ====================
  orders = {
    list: (params?: { status?: string; from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.orders.list(params)),

    detail: (id: string) => this.get(API_ENDPOINTS.orders.detail(id)),

    create: (orderData: any) =>
      this.post(API_ENDPOINTS.orders.create(), orderData),

    updateStatus: (id: string, statusData: { status: string }) =>
      this.patch(API_ENDPOINTS.orders.updateStatus(id), statusData),

    delete: (id: string) => this.delete(API_ENDPOINTS.orders.delete(id)),

    invoice: (id: string) => this.get(API_ENDPOINTS.orders.invoice(id)),

    statistics: (params?: { from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.orders.statistics(params)),

    topProducts: (limit?: number) =>
      this.get(API_ENDPOINTS.orders.topProducts(limit)),
  }

  // ==================== PURCHASES ====================
  purchases = {
    list: (params?: { supplier?: string; from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.purchases.list(params)),

    detail: (id: string) => this.get(API_ENDPOINTS.purchases.detail(id)),

    create: (purchaseData: any) =>
      this.post(API_ENDPOINTS.purchases.create(), purchaseData),

    update: (id: string, purchaseData: any) =>
      this.patch(API_ENDPOINTS.purchases.update(id), purchaseData),

    delete: (id: string) => this.delete(API_ENDPOINTS.purchases.delete(id)),

    statistics: (params?: { from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.purchases.statistics(params)),

    suppliers: () => this.get(API_ENDPOINTS.purchases.suppliers()),

    recommendations: () => this.get(API_ENDPOINTS.purchases.recommendations()),

    highPriorityRecommendations: () =>
      this.get(API_ENDPOINTS.purchases.highPriorityRecommendations()),

    lowPriorityRecommendations: () =>
      this.get(API_ENDPOINTS.purchases.lowPriorityRecommendations()),
  }

  // ==================== TRANSACTIONS ====================
  transactions = {
    summary: (params?: { from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.transactions.summary(params)),

    monthly: (year?: number) =>
      this.get(API_ENDPOINTS.transactions.monthly(year)),
  }

  // ==================== REPORTS ====================
  reports = {
    summary: (params?: { from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.reports.summary(params)),

    revenue: (params?: { from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.reports.revenue(params)),

    profit: (params?: { from?: string; to?: string }) =>
      this.get(API_ENDPOINTS.reports.profit(params)),

    export: (params?: { from?: string; to?: string }) =>
      this.downloadFile(
        API_ENDPOINTS.reports.export(params),
        `revenue-report-${new Date().toISOString().split('T')[0]}.pdf`,
      ),

    inventory: () => this.get(API_ENDPOINTS.reports.inventory()),
  }

  // ==================== DASHBOARD ====================
  dashboard = {
    summary: () => this.get(API_ENDPOINTS.dashboard.summary()),

    overview: () => this.get(API_ENDPOINTS.dashboard.overview()),

    topProducts: (limit?: number) =>
      this.get(API_ENDPOINTS.dashboard.topProducts(limit)),

    ordersTrend: (days?: number) =>
      this.get(API_ENDPOINTS.dashboard.ordersTrend(days)),

    recentActivity: () => this.get(API_ENDPOINTS.dashboard.recentActivity()),
  }
}

// Singleton instance - chỉ tạo 1 lần, dùng ở mọi nơi
export const apiService = new ApiService()

