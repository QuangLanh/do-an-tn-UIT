/**
 * Order API
 * Factory pattern để tạo các use cases và services cho Orders
 */

import { RealOrderRepository } from '@/linh-vuc/orders/repositories/RealOrderRepository'
import { OrderService } from '@/linh-vuc/orders/services/OrderService'
import { GetAllOrdersUseCase } from '@/linh-vuc/orders/usecases/GetAllOrders'
import { CreateOrderUseCase } from '@/linh-vuc/orders/usecases/CreateOrder'
import { UpdateOrderUseCase } from '@/linh-vuc/orders/usecases/UpdateOrder'
import { GetOrderSummaryUseCase } from '@/linh-vuc/orders/usecases/GetOrderSummary'

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
