export interface CreateProductInput {
  readonly name: string;
  readonly description?: string | null;
  readonly sku: string;
  readonly price: string;
  readonly stockQuantity?: number;
  readonly categoryId?: string | null;
}

export interface CreateCategoryInput {
  readonly name: string;
  readonly slug: string;
  readonly description?: string | null;
}
