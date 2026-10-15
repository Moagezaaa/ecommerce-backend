export class HttpError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class ValidationError extends HttpError {
  public constructor(message: string) {
    super(400, message);
  }
}

export class InvalidCredentialsError extends HttpError {
  public constructor() {
    super(401, 'Invalid email or password');
  }
}
