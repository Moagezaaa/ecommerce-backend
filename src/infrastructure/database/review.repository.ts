import type { QueryResultRow } from 'pg';
import type {
  CreateReviewInput,
  ReviewRepository,
} from '../../application/repositories/review.repository.js';
import type { Review } from '../../domain/entities/review.js';
import type { PostgresClient } from './postgres.client.js';

interface ReviewRow extends QueryResultRow {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
}
const map = (row: ReviewRow): Review => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  rating: row.rating,
  title: row.title,
  body: row.body,
  isApproved: row.is_approved,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
export class PostgresReviewRepository implements ReviewRepository {
  public constructor(private readonly database: PostgresClient) {}
  public async create(
    userId: string,
    productId: string,
    input: CreateReviewInput,
  ): Promise<Review> {
    const result = await this.database.pool.query<ReviewRow>(
      `INSERT INTO reviews (user_id, product_id, rating, title, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, product_id, rating, title, body, is_approved, created_at, updated_at`,
      [userId, productId, input.rating, input.title ?? null, input.body ?? null],
    );
    return map(result.rows[0] as ReviewRow);
  }
  public async findApprovedByProduct(productId: string): Promise<readonly Review[]> {
    const result = await this.database.pool.query<ReviewRow>(
      `SELECT id, user_id, product_id, rating, title, body, is_approved, created_at, updated_at
       FROM reviews WHERE product_id = $1 AND is_approved = TRUE ORDER BY created_at DESC`,
      [productId],
    );
    return result.rows.map(map);
  }
}
