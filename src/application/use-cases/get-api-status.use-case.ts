export interface ApiStatus {
  readonly message: string;
}

export class GetApiStatusUseCase {
  public execute(): ApiStatus {
    return { message: 'E-commerce API is running' };
  }
}
