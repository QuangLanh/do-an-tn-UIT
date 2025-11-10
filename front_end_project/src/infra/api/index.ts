/**
 * Central API Export
 * Export tất cả API services để UI sử dụng
 * UI chỉ cần import từ đây, không cần biết chi tiết implementation
 */

export { apiService } from './services/apiService'
export { API_ENDPOINTS } from './config/apiEndpoints'
export { default as apiClient } from './apiClient'

// Export types
export type { ApiEndpoints } from './config/apiEndpoints'

// Re-export domain-specific APIs nếu cần backward compatibility
export { productApi } from './productApi'
export { orderApi } from './orderApi'
export { purchaseApi } from './purchaseApi'
export { reportApi } from './reportApi'

