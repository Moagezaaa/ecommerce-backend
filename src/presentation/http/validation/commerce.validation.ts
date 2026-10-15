import { ValidationError } from '../errors.js';
import type { AddCartItemInput, CreateOrderInput } from '../../../application/dtos/commerce.dto.js';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const validateCartItem = (body: unknown): AddCartItemInput => {
  if (!isObject(body) || typeof body.productId !== 'string' || !body.productId.trim()) {
    throw new ValidationError('productId is required');
  }
  if (typeof body.quantity !== 'number' || !Number.isInteger(body.quantity) || body.quantity <= 0) {
    throw new ValidationError('quantity must be a positive integer');
  }
  return { productId: body.productId, quantity: body.quantity };
};

export const validateOrder = (body: unknown): CreateOrderInput => {
  if (!isObject(body) || !isObject(body.shippingAddress)) {
    throw new ValidationError('shippingAddress is required');
  }
  if (Object.keys(body.shippingAddress).length === 0) {
    throw new ValidationError('shippingAddress must not be empty');
  }
  return { shippingAddress: body.shippingAddress };
};
