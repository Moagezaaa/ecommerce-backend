import type { Review } from '../../domain/entities/review.js';

export interface CreateReviewInput {
  readonly rating: number;
  readonly title?: string | null;
  readonly body?: string | null;
}

export interface ReviewRepository {
  create(userId: string, productId: string, input: CreateReviewInput): Promise<Review>;
  findApprovedByProduct(productId: string): Promise<readonly Review[]>;
}
