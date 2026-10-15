import type { Request, Response } from 'express';
import type {
  LoginUseCase,
  RegisterUseCase,
} from '../../../application/use-cases/auth.use-cases.js';
import { validateLogin, validateRegister } from '../validation/auth.validation.js';

export class AuthController {
  public constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
  ) {}
  public async registerUser(request: Request, response: Response): Promise<void> {
    response.status(201).json(await this.register.execute(validateRegister(request.body)));
  }
  public async loginUser(request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.login.execute(validateLogin(request.body)));
  }
  public currentUser(request: Request, response: Response): void {
    response.status(200).json({ user: request.user });
  }
}
