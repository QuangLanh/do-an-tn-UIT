/**
 * Use Case: Get All Purchases
 * Lấy danh sách tất cả phiếu nhập hàng
 */

import { Purchase } from '../entities/Purchase'
import { PurchaseService } from '../services/PurchaseService'

export class GetAllPurchasesUseCase {
  constructor(private readonly purchaseService: PurchaseService) {}

  async execute(): Promise<Purchase[]> {
    return this.purchaseService.getAllPurchases()
  }
}
