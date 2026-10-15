export interface RegisterInput {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthResult {
  readonly token: string;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
  };
}
