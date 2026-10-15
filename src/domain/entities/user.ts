export interface User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly roles: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
