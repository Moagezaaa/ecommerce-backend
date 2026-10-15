export interface Category {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
