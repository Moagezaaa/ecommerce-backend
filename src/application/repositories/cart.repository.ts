import type { AddCartItemInput } from '../dtos/commerce.dto.js';
import type { Cart } from '../../domain/entities/cart.js';

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart>;
  addItem(userId: string, input: AddCartItemInput): Promise<Cart>;
}
