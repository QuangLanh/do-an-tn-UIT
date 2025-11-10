/**
 * Order API
 * Factory pattern để tạo các use cases và services cho Orders
 */

import { RealOrderRepository } from '@/domains/orders/repositories/RealOrderRepository'
import { OrderService } from '@/domains/orders/services/OrderService'
import { GetAllOrdersUseCase } from '@/domains/orders/usecases/GetAllOrders'
import { CreateOrderUseCase } from '@/domains/orders/usecases/CreateOrder'
import { UpdateOrderUseCase } from '@/domains/orders/usecases/UpdateOrder'
import { GetOrderSummaryUseCase } from '@/domains/orders/usecases/GetOrderSummary'

// Singleton instances - Using RealOrderRepository for API calls
const orderRepository = new RealOrderRepository()
const orderService = new OrderService(orderRepository)

export const orderApi = {
  getAllOrders: new GetAllOrdersUseCase(orderService),
  createOrder: new CreateOrderUseCase(orderService),
  updateOrder: new UpdateOrderUseCase(orderService),
  getOrderSummary: new GetOrderSummaryUseCase(orderService),
  service: orderService,
}
