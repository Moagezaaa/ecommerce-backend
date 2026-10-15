import type { QueryResultRow } from 'pg';
import type { CreateProductInput } from '../../application/dtos/catalog.dto.js';
import type { ProductRepository } from '../../application/repositories/product.repository.js';
import type { Product } from '../../domain/entities/product.js';
import type { PostgresClient } from './postgres.client.js';
import { HttpError } from '../../presentation/http/errors.js';

interface ProductRow extends QueryResultRow {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  stock_quantity: number;
  category_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  sku: row.sku,
  price: row.price,
  stockQuantity: row.stock_quantity,
  categoryId: row.category_id,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class PostgresProductRepository implements ProductRepository {
  public constructor(private readonly database: PostgresClient) {}

  public async findAll(): Promise<readonly Product[]> {
    const result = await this.database.pool.query<ProductRow>(
      `SELECT id, name, description, sku, price, stock_quantity, category_id,
              is_active, created_at, updated_at
       FROM products ORDER BY created_at DESC`,
    );
    return result.rows.map(mapProduct);
  }

  public async create(input: CreateProductInput): Promise<Product> {
    const result = await this.database.pool.query<ProductRow>(
      `INSERT INTO products (name, description, sku, price, stock_quantity, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, sku, price, stock_quantity, category_id,
                 is_active, created_at, updated_at`,
      [
        input.name,
        input.description ?? null,
        input.sku,
        input.price,
        input.stockQuantity ?? 0,
        input.categoryId ?? null,
      ],
    );
    return mapProduct(result.rows[0] as ProductRow);
  }

  public async updateStatus(id: string, isActive: boolean): Promise<Product> {
    const result = await this.database.pool.query<ProductRow>(
      `UPDATE products SET is_active = $2, updated_at = NOW() WHERE id = $1
       RETURNING id, name, description, sku, price, stock_quantity, category_id,
                 is_active, created_at, updated_at`,
      [id, isActive],
    );
    if (result.rowCount === 0) throw new HttpError(404, 'Product not found');
    return mapProduct(result.rows[0] as ProductRow);
  }
}
