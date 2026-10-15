export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly sku: string;
  readonly price: string;
  readonly stockQuantity: number;
  readonly categoryId: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
