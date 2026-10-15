import type { QueryResultRow } from 'pg';
import type { CreateCategoryInput } from '../../application/dtos/catalog.dto.js';
import type { CategoryRepository } from '../../application/repositories/category.repository.js';
import type { Category } from '../../domain/entities/category.js';
import type { PostgresClient } from './postgres.client.js';

interface CategoryRow extends QueryResultRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}
const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class PostgresCategoryRepository implements CategoryRepository {
  public constructor(private readonly database: PostgresClient) {}
  public async findAll(): Promise<readonly Category[]> {
    const result = await this.database.pool.query<CategoryRow>(
      'SELECT id, name, slug, description, created_at, updated_at FROM categories ORDER BY name',
    );
    return result.rows.map(mapCategory);
  }
  public async create(input: CreateCategoryInput): Promise<Category> {
    const result = await this.database.pool.query<CategoryRow>(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)
       RETURNING id, name, slug, description, created_at, updated_at`,
      [input.name, input.slug, input.description ?? null],
    );
    return mapCategory(result.rows[0] as CategoryRow);
  }
}
