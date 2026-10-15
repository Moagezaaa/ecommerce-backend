import type {
  CreateCategoryInput,
  CreateProductInput,
} from '../../../application/dtos/catalog.dto.js';
import { ValidationError } from '../errors.js';

const bodyObject = (body: unknown): Record<string, unknown> => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Request body must be an object');
  }
  return body as Record<string, unknown>;
};
const requiredText = (body: Record<string, unknown>, key: string): string => {
  const value = body[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${key} is required`);
  }
  return value.trim();
};

export const validateProduct = (body: unknown): CreateProductInput => {
  const value = bodyObject(body);
  const price = value.price;
  if (
    !(typeof price === 'number' || typeof price === 'string') ||
    String(price).trim() === '' ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    throw new ValidationError('price must be a non-negative number');
  }
  const stock = value.stockQuantity;
  if (stock !== undefined && (!Number.isInteger(stock) || (stock as number) < 0)) {
    throw new ValidationError('stockQuantity must be a non-negative integer');
  }
  const optionalText = (key: string): string | null | undefined => {
    const item = value[key];
    if (item === undefined || item === null) return item;
    if (typeof item !== 'string') throw new ValidationError(`${key} must be a string`);
    return item.trim();
  };
  const description = optionalText('description');
  const categoryId = optionalText('categoryId');
  return {
    name: requiredText(value, 'name'),
    sku: requiredText(value, 'sku'),
    price: String(price),
    ...(description !== undefined ? { description } : {}),
    ...(stock !== undefined ? { stockQuantity: stock as number } : {}),
    ...(categoryId !== undefined ? { categoryId } : {}),
  };
};

export const validateCategory = (body: unknown): CreateCategoryInput => {
  const value = bodyObject(body);
  const description = value.description;
  if (description !== undefined && description !== null && typeof description !== 'string') {
    throw new ValidationError('description must be a string');
  }
  return {
    name: requiredText(value, 'name'),
    slug: requiredText(value, 'slug'),
    ...(description !== undefined ? { description: description as string | null } : {}),
  };
};
