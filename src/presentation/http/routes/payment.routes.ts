import { Router } from 'express';
import type { PostgresClient } from '../../../infrastructure/database/postgres.client.js';
import { PostgresOrderRepository } from '../../../infrastructure/database/order.repository.js';
import { GetOrdersUseCase } from '../../../application/use-cases/commerce.use-cases.js';
import { StripePaymentAdapter } from '../../../infrastructure/payments/stripe-payment.adapter.js';
import { PaymentController } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../async-handler.js';
export const createPaymentRoutes = (
  database: PostgresClient,
  jwtSecret: string,
  stripeSecretKey?: string,
): Router => {
  const payments = stripeSecretKey ? new StripePaymentAdapter(stripeSecretKey) : null;
  const controller = new PaymentController(
    new GetOrdersUseCase(new PostgresOrderRepository(database)),
    payments,
  );
  const router = Router();
  router.post(
    '/orders/:orderId/payment-intent',
    requireAuth(database, jwtSecret),
    asyncHandler(controller.createIntent.bind(controller)),
  );
  return router;
};
