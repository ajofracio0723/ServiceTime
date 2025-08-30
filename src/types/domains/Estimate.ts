export interface EstimateItem {
  id: string;
  type: 'service' | 'part' | 'labor';
  itemId: string; // References service, part, or labor rate
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
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

export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'converted';

export interface Estimate {
  id: string;
  estimateNumber: string;
  clientId: string;
  propertyId: string;
  title: string;
  description: string;
  items: EstimateItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  terms: EstimateTerms;
  depositRequirement: DepositRequirement;
  clientApproval: ClientApproval;
  status: EstimateStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
}