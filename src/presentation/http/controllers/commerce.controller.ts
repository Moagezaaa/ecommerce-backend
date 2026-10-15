import type { Request, Response } from 'express';
import type {
  AddCartItemUseCase,
  CreateOrderUseCase,
  GetCartUseCase,
  GetOrdersUseCase,
} from '../../../application/use-cases/commerce.use-cases.js';
import { validateCartItem, validateOrder } from '../validation/commerce.validation.js';

export class CommerceController {
  public constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addItem: AddCartItemUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
  ) {}

  public async getCart(request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.getCartUseCase.execute(request.user!.id));
  }

  public async addCartItem(request: Request, response: Response): Promise<void> {
    response
      .status(201)
      .json(await this.addItem.execute(request.user!.id, validateCartItem(request.body)));
  }

  public async createOrder(request: Request, response: Response): Promise<void> {
    response
      .status(201)
      .json(await this.createOrderUseCase.execute(request.user!.id, validateOrder(request.body)));
  }

  public async getOrders(request: Request, response: Response): Promise<void> {
    response.status(200).json(await this.getOrdersUseCase.execute(request.user!.id));
  }
}
