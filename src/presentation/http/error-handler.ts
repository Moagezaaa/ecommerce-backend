import type { ErrorRequestHandler } from 'express';
import { HttpError } from './errors.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  void _next;
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
    response.status(409).json({ error: 'A resource with the same unique value already exists' });
    return;
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23503') {
    response.status(400).json({ error: 'Referenced resource does not exist' });
    return;
  }
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
};
