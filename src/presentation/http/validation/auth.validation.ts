import type { LoginInput, RegisterInput } from '../../../application/dtos/auth.dto.js';
import { ValidationError } from '../errors.js';

const object = (body: unknown): Record<string, unknown> => {
  if (body === null || typeof body !== 'object' || Array.isArray(body))
    throw new ValidationError('Request body must be an object');
  return body as Record<string, unknown>;
};
const text = (body: Record<string, unknown>, key: string): string => {
  const value = body[key];
  if (typeof value !== 'string' || value.trim() === '')
    throw new ValidationError(`${key} is required`);
  return value.trim();
};
const email = (body: Record<string, unknown>): string => {
  const value = text(body, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new ValidationError('email must be valid');
  return value;
};
export const validateRegister = (body: unknown): RegisterInput => {
  const value = object(body);
  const password = text(value, 'password');
  if (password.length < 8) throw new ValidationError('password must be at least 8 characters');
  return {
    email: email(value),
    password,
    firstName: text(value, 'firstName'),
    lastName: text(value, 'lastName'),
  };
};
export const validateLogin = (body: unknown): LoginInput => {
  const value = object(body);
  return { email: email(value), password: text(value, 'password') };
};
