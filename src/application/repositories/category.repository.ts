import type { CreateCategoryInput } from '../dtos/catalog.dto.js';
import type { Category } from '../../domain/entities/category.js';

export interface CategoryRepository {
  findAll(): Promise<readonly Category[]>;
  create(input: CreateCategoryInput): Promise<Category>;
}
