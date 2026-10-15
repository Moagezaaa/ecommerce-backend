import type { NextFunction, Request, Response } from 'express';
import { PostgresUserRepository } from '../../../infrastructure/database/user.repository.js';
import type { PostgresClient } from '../../../infrastructure/database/postgres.client.js';
import { JwtTokenSigner } from '../../../infrastructure/auth/jwt-token-signer.js';

declare global {
  // Express's Request type is intentionally extended for authenticated handlers.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; firstName: string; lastName: string; roles: string[] };
    }
  }
}

export const requireAuth = (database: PostgresClient, jwtSecret: string) => {
  const repository = new PostgresUserRepository(database);
  const signer = new JwtTokenSigner(jwtSecret);
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const header = request.get('authorization');
      if (!header?.startsWith('Bearer ')) {
        response.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { sub } = signer.verify(header.slice(7));
      const user = await repository.findById(sub);
      if (!user) {
        response.status(401).json({ error: 'Authentication required' });
        return;
      }
      request.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      };
      next();
    } catch {
      response.status(401).json({ error: 'Authentication required' });
    }
  };
};
export const requireRole = (role: string) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!request.user?.roles.includes(role)) {
      response.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
