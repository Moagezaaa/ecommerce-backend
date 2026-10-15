import { Router } from 'express';
import { GetApiStatusUseCase } from '../../../application/use-cases/get-api-status.use-case.js';
import { RootController } from '../controllers/root.controller.js';

export const createRootRoutes = (): Router => {
  const router = Router();
  const controller = new RootController(new GetApiStatusUseCase());

  router.get('/', controller.handle);

  return router;
};
