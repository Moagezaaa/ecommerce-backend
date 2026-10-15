import type { CreateProductInput } from '../dtos/catalog.dto.js';
import type { Product } from '../../domain/entities/product.js';

export interface ProductRepository {
  findAll(): Promise<readonly Product[]>;
  create(input: CreateProductInput): Promise<Product>;
  updateStatus(id: string, isActive: boolean): Promise<Product>;
}
