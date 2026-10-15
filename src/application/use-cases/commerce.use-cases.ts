import type { AddCartItemInput, CreateOrderInput } from '../dtos/commerce.dto.js';
import type { CartRepository } from '../repositories/cart.repository.js';
import type { OrderRepository } from '../repositories/order.repository.js';

export class GetCartUseCase {
  public constructor(private readonly repository: CartRepository) {}
  public execute(userId: string) {
    return this.repository.findByUserId(userId);
  }
}

export class AddCartItemUseCase {
  public constructor(private readonly repository: CartRepository) {}
  public execute(userId: string, input: AddCartItemInput) {
    return this.repository.addItem(userId, input);
  }
}

export class CreateOrderUseCase {
  public constructor(private readonly repository: OrderRepository) {}
  public execute(userId: string, input: CreateOrderInput) {
    return this.repository.createFromCart(userId, input);
  }
}

export class GetOrdersUseCase {
  public constructor(private readonly repository: OrderRepository) {}
  public execute(userId: string) {
    return this.repository.findByUserId(userId);
  }
}
