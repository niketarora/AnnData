export interface PaymentInitiateRequest {
  transactionId: string;
  amount: number;
  currency: string;
  farmerBankDetails?: {
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
}

export interface PaymentInitiateResponse {
  paymentId: string;
  provider: string;
  providerReference: string;
  status: 'PAYMENT_PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
}

export interface IPaymentGateway {
  initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse>;
  checkPaymentStatus(paymentId: string): Promise<'PAYMENT_PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'>;
}

// Isolated Mock Payment Provider for Development & Testing
export class MockPaymentGateway implements IPaymentGateway {
  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return {
      paymentId: `pay-${Date.now()}`,
      provider: 'MOCK_DBT_ESCROW',
      providerReference: `REF-UPI-DBT-${Date.now()}`,
      status: 'PAID',
    };
  }

  async checkPaymentStatus(_paymentId: string): Promise<'PAYMENT_PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'> {
    return 'PAID';
  }
}

export const defaultPaymentGateway = new MockPaymentGateway();
