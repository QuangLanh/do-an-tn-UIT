/**
 * Use Case: Create Order
 * Tạo đơn hàng mới
 */

import { Order, CreateOrderDto } from '../entities/Order'
import { OrderService } from '../services/OrderService'

export class CreateOrderUseCase {
  constructor(private readonly orderService: OrderService) {}

  async execute(orderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(orderDto)
  }
}
