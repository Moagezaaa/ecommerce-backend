import type { AuthResult, LoginInput, RegisterInput } from '../dtos/auth.dto.js';
import type { UserRepository } from '../repositories/user.repository.js';
import { InvalidCredentialsError } from '../../presentation/http/errors.js';

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenSigner {
  sign(payload: { sub: string }): string;
}

const result = (
  user: { id: string; email: string; firstName: string; lastName: string },
  signer: TokenSigner,
): AuthResult => ({
  token: signer.sign({ sub: user.id }),
  user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
});

export class RegisterUseCase {
  public constructor(
    private readonly repository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly signer: TokenSigner,
  ) {}
  public async execute(input: RegisterInput): Promise<AuthResult> {
    const user = await this.repository.create({
      email: input.email.toLowerCase(),
      passwordHash: await this.hasher.hash(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
    });
    return result(user, this.signer);
  }
}

export class LoginUseCase {
  public constructor(
    private readonly repository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly signer: TokenSigner,
  ) {}
  public async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.repository.findByEmail(input.email.toLowerCase());
    if (!user || !(await this.hasher.verify(input.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }
    return result(user, this.signer);
  }
}
