import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler =
  (
    handler: (request: Request, response: Response, next: NextFunction) => Promise<void>,
  ): RequestHandler =>
  (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
