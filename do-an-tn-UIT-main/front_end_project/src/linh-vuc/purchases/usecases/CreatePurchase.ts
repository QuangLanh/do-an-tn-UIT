/**
 * Use Case: Create Purchase
 * Tạo phiếu nhập hàng mới
 */

import { Purchase, CreatePurchaseDto } from '../entities/Purchase'
import { PurchaseService } from '../services/PurchaseService'

export class CreatePurchaseUseCase {
  constructor(private readonly purchaseService: PurchaseService) {}

  async execute(purchaseDto: CreatePurchaseDto): Promise<Purchase> {
    return this.purchaseService.createPurchase(purchaseDto)
  }
}
