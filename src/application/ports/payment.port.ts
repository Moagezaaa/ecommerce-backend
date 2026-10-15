export interface PaymentIntent {
  readonly id: string;
  readonly clientSecret: string | null;
  readonly amount: number;
  readonly currency: string;
}
export interface PaymentPort {
  createPaymentIntent(input: {
    amount: number;
    currency: string;
    orderId: string;
    userId: string;
  }): Promise<PaymentIntent>;
}
