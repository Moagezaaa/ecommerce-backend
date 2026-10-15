import { Router } from 'express';
import type { PostgresClient } from '../../../infrastructure/database/postgres.client.js';
import { PostgresCartRepository } from '../../../infrastructure/database/cart.repository.js';
import { PostgresOrderRepository } from '../../../infrastructure/database/order.repository.js';
import { CommerceController } from '../controllers/commerce.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../async-handler.js';
import {
  AddCartItemUseCase,
  CreateOrderUseCase,
  GetCartUseCase,
  GetOrdersUseCase,
} from '../../../application/use-cases/commerce.use-cases.js';

export const createCommerceRoutes = (database: PostgresClient, jwtSecret: string): Router => {
  const carts = new PostgresCartRepository(database);
  const orders = new PostgresOrderRepository(database);
  const controller = new CommerceController(
    new GetCartUseCase(carts),
    new AddCartItemUseCase(carts),
    new CreateOrderUseCase(orders),
    new GetOrdersUseCase(orders),
  );
  const router = Router();
  router.use(requireAuth(database, jwtSecret));
  router.get('/cart/items', asyncHandler(controller.getCart.bind(controller)));
  router.post('/cart/items', asyncHandler(controller.addCartItem.bind(controller)));
  router.post('/orders', asyncHandler(controller.createOrder.bind(controller)));
  router.get('/orders', asyncHandler(controller.getOrders.bind(controller)));
  return router;
};
