/**
 * Use Case: Update Purchase
 * Cập nhật thông tin phiếu nhập hàng
 */

import { Purchase, UpdatePurchaseDto } from '../entities/Purchase'
import { PurchaseService } from '../services/PurchaseService'

export class UpdatePurchaseUseCase {
  constructor(private readonly purchaseService: PurchaseService) {}

  async execute(id: string, purchaseDto: UpdatePurchaseDto): Promise<Purchase> {
    return this.purchaseService.updatePurchase(id, purchaseDto)
  }
}
