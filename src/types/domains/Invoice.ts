export interface InvoiceLineItem {
  id: string;
  type: 'service' | 'part' | 'labor' | 'discount' | 'tax';
  itemId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface InvoiceBalance {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  jobIds: string[];
  visitIds: string[];
  lineItems: InvoiceLineItem[];
  balance: InvoiceBalance;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  terms: string;
  notes?: string;
  templateId: string;
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}