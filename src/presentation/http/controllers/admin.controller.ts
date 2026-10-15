import type { Request, Response } from 'express';
import type { UpdateProductStatusUseCase } from '../../../application/use-cases/catalog.use-cases.js';
export class AdminController {
  public constructor(private readonly updateStatus: UpdateProductStatusUseCase) {}
  public async updateProductStatus(request: Request, response: Response): Promise<void> {
    const isActive = request.body?.isActive;
    if (typeof isActive !== 'boolean') {
      response.status(400).json({ error: 'isActive must be a boolean' });
      return;
    }
    response
      .status(200)
      .json(await this.updateStatus.execute(String(request.params.productId), isActive));
  }
}
