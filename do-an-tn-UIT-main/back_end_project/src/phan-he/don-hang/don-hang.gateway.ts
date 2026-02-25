import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Order } from './schemas/order.schema';

/**
 * Gateway WebSocket cho đơn hàng.
 * Phát sự kiện real-time để frontend nhận biết có đơn mới / đơn cập nhật trạng thái
 * mà không cần polling API liên tục.
 */
@WebSocketGateway({
  namespace: '/orders',
  cors: {
    origin: (process.env.FRONTEND_URLS || 'http://localhost:5173,http://localhost:5174')
      .split(',')
      .map((url) => url.trim()),
    credentials: true,
  },
})
@Injectable()
export class DonHangGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DonHangGateway.name);

  /**
   * Gửi sự kiện khi tạo đơn mới.
   */
  emitOrderCreated(order: Order) {
    const payload = this.buildOrderPayload(order);
    this.logger.debug(`Emitting order.created for ${payload.orderNumber}`);
    this.server.emit('order.created', payload);
  }

  /**
   * Gửi sự kiện khi đơn được cập nhật (trạng thái / thanh toán / hủy, ...).
   */
  emitOrderUpdated(order: Order) {
    const payload = this.buildOrderPayload(order);
    this.logger.debug(`Emitting order.updated for ${payload.orderNumber}`);
    this.server.emit('order.updated', payload);
  }

  private buildOrderPayload(order: any) {
    // Chỉ gửi các field cần thiết cho UI
    const id =
      typeof order._id === 'string'
        ? order._id
        : order._id?.toString?.() ?? order.id;

    return {
      id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      isOnline: order.isOnline,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

