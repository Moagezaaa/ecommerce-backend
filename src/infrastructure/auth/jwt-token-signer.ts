import jwt from 'jsonwebtoken';
import type { TokenSigner } from '../../application/use-cases/auth.use-cases.js';

export class JwtTokenSigner implements TokenSigner {
  public constructor(private readonly secret: string) {}
  public sign(payload: { sub: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }
  public verify(token: string): { sub: string } {
    const payload = jwt.verify(token, this.secret);
    if (typeof payload === 'string' || typeof payload.sub !== 'string')
      throw new Error('Invalid token');
    return { sub: payload.sub };
  }
}
