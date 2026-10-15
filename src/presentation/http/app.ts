import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createRootRoutes } from './routes/root.routes.js';
import type { PostgresClient } from '../../infrastructure/database/postgres.client.js';
import { createCatalogRoutes } from './routes/catalog.routes.js';
import { errorHandler } from './error-handler.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createCommerceRoutes } from './routes/commerce.routes.js';
import { createReviewRoutes } from './routes/review.routes.js';
import { createAdminRoutes } from './routes/admin.routes.js';
import { createPaymentRoutes } from './routes/payment.routes.js';

export const createApp = (
  database?: PostgresClient,
  jwtSecret?: string,
  stripeSecretKey?: string,
) => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(createRootRoutes());
  if (database) {
    app.use(createCatalogRoutes(database));
    if (jwtSecret) app.use(createAuthRoutes(database, jwtSecret));
    if (jwtSecret) app.use(createCommerceRoutes(database, jwtSecret));
    if (jwtSecret) app.use(createReviewRoutes(database, jwtSecret));
    if (jwtSecret) app.use(createAdminRoutes(database, jwtSecret));
    if (jwtSecret) app.use(createPaymentRoutes(database, jwtSecret, stripeSecretKey));
  }
  app.use(errorHandler);

  return app;
};
