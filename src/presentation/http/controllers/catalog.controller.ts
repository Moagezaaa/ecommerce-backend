import type { Request, Response } from 'express';
import type {
  CreateCategoryUseCase,
  CreateProductUseCase,
  GetCategoriesUseCase,
  GetProductsUseCase,
} from '../../../application/use-cases/catalog.use-cases.js';
import { validateCategory, validateProduct } from '../validation/catalog.validation.js';

export class CatalogController {
  public constructor(
    private readonly getProducts: GetProductsUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly getCategories: GetCategoriesUseCase,
    private readonly createCategory: CreateCategoryUseCase,
  ) {}
  public async listProducts(_request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.getProducts.execute());
  }
  public async addProduct(request: Request, response: Response): Promise<void> {
    response.status(201).json(await this.createProduct.execute(validateProduct(request.body)));
  }
  public async listCategories(_request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.getCategories.execute());
  }
  public async addCategory(request: Request, response: Response): Promise<void> {
    response.status(201).json(await this.createCategory.execute(validateCategory(request.body)));
  }
}
