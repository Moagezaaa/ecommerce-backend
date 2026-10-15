import type { CreateCategoryInput, CreateProductInput } from '../dtos/catalog.dto.js';
import type { CategoryRepository } from '../repositories/category.repository.js';
import type { ProductRepository } from '../repositories/product.repository.js';

export class GetProductsUseCase {
  public constructor(private readonly repository: ProductRepository) {}
  public execute() {
    return this.repository.findAll();
  }
}

export class CreateProductUseCase {
  public constructor(private readonly repository: ProductRepository) {}
  public execute(input: CreateProductInput) {
    return this.repository.create(input);
  }
}
export class UpdateProductStatusUseCase {
  public constructor(private readonly repository: ProductRepository) {}
  public execute(id: string, isActive: boolean) {
    return this.repository.updateStatus(id, isActive);
  }
}

export class GetCategoriesUseCase {
  public constructor(private readonly repository: CategoryRepository) {}
  public execute() {
    return this.repository.findAll();
  }
}

export class CreateCategoryUseCase {
  public constructor(private readonly repository: CategoryRepository) {}
  public execute(input: CreateCategoryInput) {
    return this.repository.create(input);
  }
}
