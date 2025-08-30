export type PaymentMethod = 'card' | 'ach' | 'check' | 'cash' | 'other';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type TransactionType = 'charge' | 'refund' | 'adjustment';

export interface StripeToken {
  id: string;
  customerId?: string;
  paymentMethodId?: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  stripeToken?: StripeToken;
  method: PaymentMethod;
  amount: number;
  processingFee: number;
  netAmount: number;
  status: PaymentStatus;
  transactionId?: string;
  failureReason?: string;
  refundAmount?: number;
  refundReason?: string;
  ledgerEntries: LedgerEntry[];
  processedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}