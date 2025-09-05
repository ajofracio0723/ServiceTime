export interface EstimateItem {
  id: string;
  type: 'service' | 'part' | 'labor' | 'material' | 'equipment';
  itemId?: string; // References service, part, or labor rate
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxable: boolean;
  total: number;
}

export interface EstimateTerms {
  validUntil: string;
  paymentTerms: string;
  warrantyPeriod?: string;
  additionalTerms?: string;
}

export interface DepositRequirement {
  isRequired: boolean;
  amount?: number;
  percentage?: number;
  dueDate?: string;
}

export interface ClientApproval {
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  signature?: string;
  notes?: string;
}

export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'converted' | 'cancelled';

export interface EstimateTax {
  name: string;
  rate: number;
  amount: number;
}

export interface EstimateDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  reason?: string;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: Omit<EstimateItem, 'id' | 'total'>[];
  defaultTerms: EstimateTerms;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  clientId: string;
  propertyId: string;
  title: string;
  description: string;
  items: EstimateItem[];
  subtotal: number;
  taxes: EstimateTax[];
  totalTaxAmount: number;
  discounts: EstimateDiscount[];
  totalDiscountAmount: number;
  total: number;
  terms: EstimateTerms;
  depositRequirement: DepositRequirement;
  clientApproval: ClientApproval;
  status: EstimateStatus;
  templateId?: string;
  notes?: string;
  internalNotes?: string;
  attachments: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  expiredAt?: string;
  convertedToJobAt?: string;
  jobId?: string;
}