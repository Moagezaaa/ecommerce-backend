import { Router } from 'express';
import type { PostgresClient } from '../../../infrastructure/database/postgres.client.js';
import { PostgresReviewRepository } from '../../../infrastructure/database/review.repository.js';
import {
  CreateReviewUseCase,
  ListReviewsUseCase,
} from '../../../application/use-cases/review.use-cases.js';
import { ReviewController } from '../controllers/review.controller.js';
import { asyncHandler } from '../async-handler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
export const createReviewRoutes = (database: PostgresClient, jwtSecret: string): Router => {
  const repository = new PostgresReviewRepository(database);
  const controller = new ReviewController(
    new CreateReviewUseCase(repository),
    new ListReviewsUseCase(repository),
  );
  const router = Router();
  router.get('/products/:productId/reviews', asyncHandler(controller.listReviews.bind(controller)));
  router.post(
    '/products/:productId/reviews',
    requireAuth(database, jwtSecret),
    asyncHandler(controller.createReview.bind(controller)),
  );
  return router;
};
