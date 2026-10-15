export interface Review {
  readonly id: string;
  readonly userId: string;
  readonly productId: string;
  readonly rating: number;
  readonly title: string | null;
  readonly body: string | null;
  readonly isApproved: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
