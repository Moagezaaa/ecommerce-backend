import type { Request, Response } from 'express';
import type {
  CreateReviewUseCase,
  ListReviewsUseCase,
} from '../../../application/use-cases/review.use-cases.js';
import { validateReview } from '../validation/review.validation.js';
export class ReviewController {
  public constructor(
    private readonly create: CreateReviewUseCase,
    private readonly list: ListReviewsUseCase,
  ) {}
  public async createReview(request: Request, response: Response): Promise<void> {
    response
      .status(201)
      .json(
        await this.create.execute(
          request.user!.id,
          String(request.params.productId),
          validateReview(request.body),
        ),
      );
  }
  public async listReviews(request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.list.execute(String(request.params.productId)));
  }
}
