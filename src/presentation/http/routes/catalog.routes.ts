import { Router } from 'express';
import {
  GetCategoriesUseCase,
  CreateCategoryUseCase,
  CreateProductUseCase,
  GetProductsUseCase,
} from '../../../application/use-cases/catalog.use-cases.js';
import type { PostgresClient } from '../../../infrastructure/database/postgres.client.js';
import { PostgresCategoryRepository } from '../../../infrastructure/database/category.repository.js';
import { PostgresProductRepository } from '../../../infrastructure/database/product.repository.js';
import { asyncHandler } from '../async-handler.js';
import { CatalogController } from '../controllers/catalog.controller.js';

export const createCatalogRoutes = (database: PostgresClient): Router => {
  const products = new PostgresProductRepository(database);
  const categories = new PostgresCategoryRepository(database);
  const controller = new CatalogController(
    new GetProductsUseCase(products),
    new CreateProductUseCase(products),
    new GetCategoriesUseCase(categories),
    new CreateCategoryUseCase(categories),
  );
  const router = Router();
  router.get('/products', asyncHandler(controller.listProducts.bind(controller)));
  router.post('/products', asyncHandler(controller.addProduct.bind(controller)));
  router.get('/categories', asyncHandler(controller.listCategories.bind(controller)));
  router.post('/categories', asyncHandler(controller.addCategory.bind(controller)));
  return router;
};
