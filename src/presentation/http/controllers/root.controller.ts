import type { Request, Response } from 'express';
import type { GetApiStatusUseCase } from '../../../application/use-cases/get-api-status.use-case.js';

export class RootController {
  public constructor(private readonly getApiStatus: GetApiStatusUseCase) {}

  public handle = (_request: Request, response: Response): void => {
    response.status(200).json(this.getApiStatus.execute());
  };
}
