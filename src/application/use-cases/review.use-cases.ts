import type { CreateReviewInput, ReviewRepository } from '../repositories/review.repository.js';
export class CreateReviewUseCase {
  public constructor(private readonly repository: ReviewRepository) {}
  public execute(userId: string, productId: string, input: CreateReviewInput) {
    return this.repository.create(userId, productId, input);
  }
}
export class ListReviewsUseCase {
  public constructor(private readonly repository: ReviewRepository) {}
  public execute(productId: string) {
    return this.repository.findApprovedByProduct(productId);
  }
}
