/**
 * API Endpoints Configuration
 * Tập trung tất cả API endpoints của backend
 * Chỉ cần truyền URL pattern và params, không cần biết chi tiết implementation
 */

export const API_ENDPOINTS = {
  // ==================== AUTH ====================
  auth: {
    login: () => '/auth/login',
    customerLogin: () => '/auth/customer/login',
    customerMe: () => '/auth/customer/me',
    register: () => '/auth/register',
    profile: () => '/auth/profile',
  },

  // ==================== USERS ====================
  users: {
    list: () => '/users',
    detail: (id: string) => `/users/${id}`,
    create: () => '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },

  // ==================== PRODUCTS ====================
  products: {
    list: (params?: { category?: string; search?: string; lowStock?: boolean }) => {
      const query = new URLSearchParams()
      if (params?.category) query.append('category', params.category)
      if (params?.search) query.append('search', params.search)
      if (params?.lowStock) query.append('lowStock', 'true')
      const queryString = query.toString()
      return `/products${queryString ? `?${queryString}` : ''}`
    },
    detail: (id: string) => `/products/${id}`,
    byBarcode: (barcode: string) => `/products/barcode/${encodeURIComponent(barcode)}`,
    create: () => '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    updateStock: (id: string) => `/products/${id}/stock`,
    lowStock: () => '/products/low-stock',
    categories: () => '/products/categories',
  },

  // ==================== ORDERS ====================
  orders: {
    list: (params?: { status?: string; from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.status) query.append('status', params.status)
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/orders${queryString ? `?${queryString}` : ''}`
    },
    detail: (id: string) => `/orders/${id}`,
    create: () => '/orders',
    updateStatus: (id: string) => `/orders/${id}/status`,
    delete: (id: string) => `/orders/${id}`,
    invoice: (id: string) => `/orders/${id}/invoice`,
    statistics: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/orders/statistics${queryString ? `?${queryString}` : ''}`
    },
    topProducts: (limit?: number) => {
      const query = new URLSearchParams()
      if (limit) query.append('limit', limit.toString())
      const queryString = query.toString()
      return `/orders/top-products${queryString ? `?${queryString}` : ''}`
    },
    history: () => '/orders/history',
    debts: () => '/orders/debts',
    payDebt: (id: string) => `/orders/${id}/pay-debt`,
  },

  // ==================== SHOPPING LISTS ====================
  shoppingLists: {
    create: () => '/shopping-lists',
    active: () => '/shopping-lists/active',
    update: (id: string) => `/shopping-lists/${id}`,
    delete: (id: string) => `/shopping-lists/${id}`,
    complete: (id: string) => `/shopping-lists/${id}/complete`,
  },

  // ==================== PURCHASES ====================
  purchases: {
    list: (params?: { supplier?: string; from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.supplier) query.append('supplier', params.supplier)
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/purchases${queryString ? `?${queryString}` : ''}`
    },
    detail: (id: string) => `/purchases/${id}`,
    create: () => '/purchases',
    update: (id: string) => `/purchases/${id}`,
    delete: (id: string) => `/purchases/${id}`,
    statistics: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/purchases/statistics${queryString ? `?${queryString}` : ''}`
    },
    suppliers: () => '/purchases/suppliers',
    recommendations: () => '/purchases/recommendations',
    highPriorityRecommendations: () => '/purchases/recommendations/high-priority',
    lowPriorityRecommendations: () => '/purchases/recommendations/low-priority',
  },

  // ==================== TRANSACTIONS ====================
  transactions: {
    summary: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/transactions/summary${queryString ? `?${queryString}` : ''}`
    },
    monthly: (year?: number) => {
      const query = new URLSearchParams()
      if (year) query.append('year', year.toString())
      const queryString = query.toString()
      return `/transactions/monthly${queryString ? `?${queryString}` : ''}`
    },
  },

  // ==================== REPORTS ====================
  reports: {
    summary: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/reports/summary${queryString ? `?${queryString}` : ''}`
    },
    revenue: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/reports/revenue${queryString ? `?${queryString}` : ''}`
    },
    profit: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/reports/profit${queryString ? `?${queryString}` : ''}`
    },
    export: (params?: { from?: string; to?: string }) => {
      const query = new URLSearchParams()
      if (params?.from) query.append('from', params.from)
      if (params?.to) query.append('to', params.to)
      const queryString = query.toString()
      return `/reports/export${queryString ? `?${queryString}` : ''}`
    },
    inventory: () => '/reports/inventory',
  },

  // ==================== DASHBOARD ====================
  dashboard: {
    summary: () => '/dashboard/summary',
    overview: () => '/dashboard/overview',
    topProducts: (limit?: number) => {
      const query = new URLSearchParams()
      if (limit) query.append('limit', limit.toString())
      const queryString = query.toString()
      return `/dashboard/top-products${queryString ? `?${queryString}` : ''}`
    },
    ordersTrend: (days?: number) => {
      const query = new URLSearchParams()
      if (days) query.append('days', days.toString())
      const queryString = query.toString()
      return `/dashboard/orders-trend${queryString ? `?${queryString}` : ''}`
    },
    recentActivity: () => '/dashboard/recent-activity',
  },
} as const

// Type helper để auto-complete
export type ApiEndpoints = typeof API_ENDPOINTS

