import { ValidationError } from '../errors.js';
import type { CreateReviewInput } from '../../../application/repositories/review.repository.js';
export const validateReview = (body: unknown): CreateReviewInput => {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ValidationError('Request body must be an object');
  const value = body as Record<string, unknown>;
  if (!Number.isInteger(value.rating) || Number(value.rating) < 1 || Number(value.rating) > 5) {
    throw new ValidationError('rating must be an integer between 1 and 5');
  }
  const optional = (key: string): string | null | undefined => {
    const item = value[key];
    if (item === undefined || item === null) return item as null | undefined;
    if (typeof item !== 'string') throw new ValidationError(`${key} must be a string`);
    return item.trim();
  };
  const title = optional('title');
  const bodyText = optional('body');
  return {
    rating: value.rating as number,
    ...(title !== undefined ? { title } : {}),
    ...(bodyText !== undefined ? { body: bodyText } : {}),
  };
};
