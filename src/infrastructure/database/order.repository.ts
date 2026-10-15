import type { PoolClient, QueryResultRow } from 'pg';
import type { CreateOrderInput } from '../../application/dtos/commerce.dto.js';
import type { OrderRepository } from '../../application/repositories/order.repository.js';
import type { Order } from '../../domain/entities/order.js';
import { HttpError } from '../../presentation/http/errors.js';
import type { PostgresClient } from './postgres.client.js';

interface OrderRow extends QueryResultRow {
  id: string;
  user_id: string;
  status: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  total: string;
  shipping_address: Record<string, unknown>;
  created_at: Date;
}
interface ItemRow extends QueryResultRow {
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
}

const mapOrders = (orders: OrderRow[], items: ItemRow[]): Order[] =>
  orders.map((order) => ({
    id: order.id,
    userId: order.user_id,
    status: order.status,
    subtotal: order.subtotal,
    discountTotal: order.discount_total,
    shippingTotal: order.shipping_total,
    total: order.total,
    shippingAddress: order.shipping_address,
    createdAt: order.created_at,
    items: items
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        lineTotal: item.line_total,
      })),
  }));

const readOrders = async (client: Pick<PoolClient, 'query'>, userId: string): Promise<Order[]> => {
  const orders = await client.query<OrderRow>(
    `SELECT id, user_id, status, subtotal::text, discount_total::text, shipping_total::text,
            total::text, shipping_address, created_at FROM orders
     WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  const items = await client.query<ItemRow>(
    `SELECT oi.order_id, oi.product_id, oi.product_name, oi.unit_price::text,
            oi.quantity, oi.line_total::text FROM order_items oi
     JOIN orders o ON o.id = oi.order_id WHERE o.user_id = $1 ORDER BY oi.id`,
    [userId],
  );
  return mapOrders(orders.rows, items.rows);
};

export class PostgresOrderRepository implements OrderRepository {
  public constructor(private readonly database: PostgresClient) {}

  public async createFromCart(userId: string, input: CreateOrderInput): Promise<Order> {
    const client = await this.database.pool.connect();
    try {
      await client.query('BEGIN');
      const cart = await client.query<{ id: string }>(
        'SELECT id FROM carts WHERE user_id = $1 FOR UPDATE',
        [userId],
      );
      if (cart.rowCount === 0) throw new HttpError(400, 'Cart is empty');
      const lines = await client.query<ItemRow & { stock_quantity: number }>(
        `SELECT ci.product_id, p.name AS product_name, p.price::text AS unit_price,
                ci.quantity, p.stock_quantity
         FROM cart_items ci JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = $1 ORDER BY ci.product_id FOR UPDATE OF p`,
        [cart.rows[0]!.id],
      );
      if (lines.rowCount === 0) throw new HttpError(400, 'Cart is empty');
      for (const line of lines.rows) {
        if (line.stock_quantity < line.quantity) {
          throw new HttpError(409, `Insufficient inventory for ${line.product_name}`);
        }
      }
      const subtotal = lines.rows.reduce(
        (sum, line) => sum + Number(line.unit_price) * line.quantity,
        0,
      );
      const order = await client.query<OrderRow>(
        `INSERT INTO orders (user_id, subtotal, total, shipping_address)
         VALUES ($1, $2, $2, $3) RETURNING id, user_id, status, subtotal::text,
         discount_total::text, shipping_total::text, total::text, shipping_address, created_at`,
        [userId, subtotal.toFixed(2), input.shippingAddress],
      );
      for (const line of lines.rows) {
        const lineTotal = (Number(line.unit_price) * line.quantity).toFixed(2);
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.rows[0]!.id,
            line.product_id,
            line.product_name,
            line.unit_price,
            line.quantity,
            lineTotal,
          ],
        );
        await client.query(
          `UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = NOW() WHERE id = $2`,
          [line.quantity, line.product_id],
        );
        await client.query(
          `INSERT INTO inventory_movements (product_id, quantity_delta, reason, reference_id)
           VALUES ($1, $2, 'order', $3)`,
          [line.product_id, -line.quantity, order.rows[0]!.id],
        );
      }
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.rows[0]!.id]);
      await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.rows[0]!.id]);
      await client.query('COMMIT');
      return mapOrders(
        order.rows,
        (lines.rows as ItemRow[]).map((line) => ({
          ...line,
          order_id: order.rows[0]!.id,
          line_total: (Number(line.unit_price) * line.quantity).toFixed(2),
        })),
      )[0]!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findByUserId(userId: string): Promise<readonly Order[]> {
    return readOrders(this.database.pool, userId);
  }
}
