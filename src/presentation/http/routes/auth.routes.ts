import { Router } from 'express';
import type { PostgresClient } from '../../../infrastructure/database/postgres.client.js';
import { PostgresUserRepository } from '../../../infrastructure/database/user.repository.js';
import { CryptoPasswordHasher } from '../../../infrastructure/auth/password-hasher.js';
import { JwtTokenSigner } from '../../../infrastructure/auth/jwt-token-signer.js';
import { RegisterUseCase, LoginUseCase } from '../../../application/use-cases/auth.use-cases.js';
import { asyncHandler } from '../async-handler.js';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const createAuthRoutes = (database: PostgresClient, jwtSecret: string): Router => {
  const repository = new PostgresUserRepository(database);
  const hasher = new CryptoPasswordHasher();
  const signer = new JwtTokenSigner(jwtSecret);
  const controller = new AuthController(
    new RegisterUseCase(repository, hasher, signer),
    new LoginUseCase(repository, hasher, signer),
  );
  const router = Router();
  router.post('/auth/register', asyncHandler(controller.registerUser.bind(controller)));
  router.post('/auth/login', asyncHandler(controller.loginUser.bind(controller)));
  router.get('/auth/me', requireAuth(database, jwtSecret), controller.currentUser.bind(controller));
  return router;
};
