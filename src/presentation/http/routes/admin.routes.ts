import { Router } from 'express';
import type { PostgresClient } from '../../../infrastructure/database/postgres.client.js';
import { PostgresProductRepository } from '../../../infrastructure/database/product.repository.js';
import { UpdateProductStatusUseCase } from '../../../application/use-cases/catalog.use-cases.js';
import { AdminController } from '../controllers/admin.controller.js';
import { asyncHandler } from '../async-handler.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
export const createAdminRoutes = (database: PostgresClient, jwtSecret: string): Router => {
  const controller = new AdminController(
    new UpdateProductStatusUseCase(new PostgresProductRepository(database)),
  );
  const router = Router();
  router.patch(
    '/admin/products/:productId/status',
    requireAuth(database, jwtSecret),
    requireRole('admin'),
    asyncHandler(controller.updateProductStatus.bind(controller)),
  );
  router.patch(
    '/admin/products/:productId/approval',
    requireAuth(database, jwtSecret),
    requireRole('admin'),
    asyncHandler(controller.updateProductStatus.bind(controller)),
  );
  return router;
};
