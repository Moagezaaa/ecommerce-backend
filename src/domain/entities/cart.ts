export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: readonly CartItem[];
  subtotal: string;
}
