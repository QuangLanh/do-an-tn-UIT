/**
 * Use Case: Get All Orders
 * Lấy danh sách tất cả đơn hàng
 */

import { Order } from '../entities/Order'
import { OrderService } from '../services/OrderService'

export class GetAllOrdersUseCase {
  constructor(private readonly orderService: OrderService) {}

  async execute(): Promise<Order[]> {
    return this.orderService.getAllOrders()
  }
}
