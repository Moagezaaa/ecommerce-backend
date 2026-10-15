export interface AddCartItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  shippingAddress: Record<string, unknown>;
}
