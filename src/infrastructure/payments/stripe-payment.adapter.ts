import Stripe from 'stripe';
import type { PaymentIntent, PaymentPort } from '../../application/ports/payment.port.js';
export class StripePaymentAdapter implements PaymentPort {
  private readonly stripe: Stripe;
  public constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }
  public async createPaymentIntent(input: {
    amount: number;
    currency: string;
    orderId: string;
    userId: string;
  }): Promise<PaymentIntent> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency,
      metadata: { orderId: input.orderId, userId: input.userId },
    });
    return {
      id: intent.id,
      clientSecret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
    };
  }
}
