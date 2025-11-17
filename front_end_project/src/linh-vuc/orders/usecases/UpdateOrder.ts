/**
 * Use Case: Update Order
 * Cập nhật thông tin đơn hàng
 */

import { Order, UpdateOrderDto } from '../entities/Order'
import { OrderService } from '../services/OrderService'

export class UpdateOrderUseCase {
  constructor(private readonly orderService: OrderService) {}

  async execute(id: string, orderDto: UpdateOrderDto): Promise<Order> {
    return this.orderService.updateOrder(id, orderDto)
  }
}
