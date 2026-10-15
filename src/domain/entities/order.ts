import type { CartItem } from './cart.js';

export interface Order {
  id: string;
  userId: string;
  status: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  total: string;
  shippingAddress: Record<string, unknown>;
  items: readonly CartItem[];
  createdAt: Date;
}
