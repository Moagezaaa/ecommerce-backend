import type { QueryResultRow } from 'pg';
import type { AddCartItemInput } from '../../application/dtos/commerce.dto.js';
import type { CartRepository } from '../../application/repositories/cart.repository.js';
import type { Cart } from '../../domain/entities/cart.js';
import type { PostgresClient } from './postgres.client.js';
import { HttpError } from '../../presentation/http/errors.js';

interface CartRow extends QueryResultRow {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

const mapCart = (rows: CartRow[], id: string, userId: string): Cart => {
  const items = rows.map((row) => ({
    productId: row.product_id,
    productName: row.product_name,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    lineTotal: row.line_total,
  }));
  return {
    id,
    userId,
    items,
    subtotal: items.reduce((sum, item) => sum + Number(item.lineTotal), 0).toFixed(2),
  };
};

export class PostgresCartRepository implements CartRepository {
  public constructor(private readonly database: PostgresClient) {}

  public async findByUserId(userId: string): Promise<Cart> {
    const result = await this.database.pool.query<CartRow>(
      `INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET updated_at = carts.updated_at
       RETURNING id, user_id`,
      [userId],
    );
    const cart = result.rows[0] as Pick<CartRow, 'id' | 'user_id'>;
    const items = await this.database.pool.query<CartRow>(
      `SELECT c.id, c.user_id, ci.product_id, p.name AS product_name, p.price AS unit_price,
              ci.quantity, (p.price * ci.quantity)::numeric(12,2)::text AS line_total
       FROM carts c JOIN cart_items ci ON ci.cart_id = c.id
       JOIN products p ON p.id = ci.product_id
       WHERE c.user_id = $1 ORDER BY ci.created_at`,
      [userId],
    );
    return mapCart(items.rows, cart.id, cart.user_id);
  }

  public async addItem(userId: string, input: AddCartItemInput): Promise<Cart> {
    const product = await this.database.pool.query<{ id: string }>(
      'SELECT id FROM products WHERE id = $1 AND is_active = TRUE',
      [input.productId],
    );
    if (product.rowCount === 0) {
      throw new HttpError(404, 'Product does not exist or is inactive');
    }
    await this.database.pool.query(
      `WITH cart AS (
         INSERT INTO carts (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
         RETURNING id
       )
       INSERT INTO cart_items (cart_id, product_id, quantity)
       SELECT id, $2, $3 FROM cart
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, created_at = NOW()`,
      [userId, input.productId, input.quantity],
    );
    return this.findByUserId(userId);
  }
}
