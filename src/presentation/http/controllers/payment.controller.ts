import type { Request, Response } from 'express';
import type { GetOrdersUseCase } from '../../../application/use-cases/commerce.use-cases.js';
import type { PaymentPort } from '../../../application/ports/payment.port.js';
import { HttpError, ValidationError } from '../errors.js';
export class PaymentController {
  public constructor(
    private readonly orders: GetOrdersUseCase,
    private readonly payments: PaymentPort | null,
  ) {}
  public async createIntent(request: Request, response: Response): Promise<void> {
    if (!this.payments) throw new HttpError(503, 'Stripe payments are not configured');
    const orderId = String(request.params.orderId);
    if (!orderId) throw new ValidationError('orderId is required');
    const order = (await this.orders.execute(request.user!.id)).find((item) => item.id === orderId);
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status !== 'pending') throw new HttpError(409, 'Only pending orders can be paid');
    const currency =
      typeof request.body?.currency === 'string' ? request.body.currency.toLowerCase() : 'usd';
    response.status(201).json(
      await this.payments.createPaymentIntent({
        amount: Number(order.total),
        currency,
        orderId,
        userId: request.user!.id,
      }),
    );
  }
}
