import type { CreateOrderInput } from '../dtos/commerce.dto.js';
import type { Order } from '../../domain/entities/order.js';

export interface OrderRepository {
  createFromCart(userId: string, input: CreateOrderInput): Promise<Order>;
  findByUserId(userId: string): Promise<readonly Order[]>;
}
