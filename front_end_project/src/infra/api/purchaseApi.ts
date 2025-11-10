/**
 * Purchase API
 * Factory pattern để tạo các use cases và services cho Purchases
 */

import { RealPurchaseRepository } from '@/domains/purchases/repositories/RealPurchaseRepository'
import { PurchaseService } from '@/domains/purchases/services/PurchaseService'
import { GetAllPurchasesUseCase } from '@/domains/purchases/usecases/GetAllPurchases'
import { CreatePurchaseUseCase } from '@/domains/purchases/usecases/CreatePurchase'
import { UpdatePurchaseUseCase } from '@/domains/purchases/usecases/UpdatePurchase'
import { GetPurchaseSummaryUseCase } from '@/domains/purchases/usecases/GetPurchaseSummary'

// Singleton instances
// Sử dụng RealPurchaseRepository để call API từ backend
// Có thể switch giữa RealPurchaseRepository và PurchaseRepository (mock) bằng cách thay đổi dòng này
const purchaseRepository: RealPurchaseRepository = new RealPurchaseRepository()
const purchaseService = new PurchaseService(purchaseRepository)

export const purchaseApi = {
  getAllPurchases: new GetAllPurchasesUseCase(purchaseService),
  createPurchase: new CreatePurchaseUseCase(purchaseService),
  updatePurchase: new UpdatePurchaseUseCase(purchaseService),
  getPurchaseSummary: new GetPurchaseSummaryUseCase(purchaseService),
  service: purchaseService,
  
  // Recommendations endpoints
  getRecommendations: () => purchaseService.getRecommendations(),
  getHighPriorityRecommendations: () => purchaseService.getHighPriorityRecommendations(),
  getLowPriorityRecommendations: () => purchaseService.getLowPriorityRecommendations(),
}
