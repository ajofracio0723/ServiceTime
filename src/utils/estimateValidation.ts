import { Estimate, EstimateItem } from '../types/domains/Estimate';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEstimate = (estimate: Partial<Estimate>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Basic required fields
  if (!estimate.title?.trim()) {
    errors.push({ field: 'title', message: 'Estimate title is required' });
  }

  if (!estimate.clientId) {
    errors.push({ field: 'clientId', message: 'Client selection is required' });
  }

  if (!estimate.propertyId) {
    errors.push({ field: 'propertyId', message: 'Property selection is required' });
  }

  // Items validation
  if (!estimate.items || estimate.items.length === 0) {
    errors.push({ field: 'items', message: 'At least one estimate item is required' });
  } else {
    estimate.items.forEach((item, index) => {
      if (!item.name?.trim()) {
        errors.push({ field: `items.${index}.name`, message: `Item ${index + 1}: Name is required` });
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({ field: `items.${index}.quantity`, message: `Item ${index + 1}: Quantity must be greater than 0` });
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        errors.push({ field: `items.${index}.unitPrice`, message: `Item ${index + 1}: Unit price must be 0 or greater` });
      }
    });
  }

  // Terms validation
  if (!estimate.terms?.validUntil) {
    errors.push({ field: 'terms.validUntil', message: 'Valid until date is required' });
  } else {
    const validUntilDate = new Date(estimate.terms.validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (validUntilDate < today) {
      errors.push({ field: 'terms.validUntil', message: 'Valid until date cannot be in the past' });
    }
  }

  if (!estimate.terms?.paymentTerms?.trim()) {
    errors.push({ field: 'terms.paymentTerms', message: 'Payment terms are required' });
  }

  // Deposit validation
  if (estimate.depositRequirement?.isRequired) {
    if (!estimate.depositRequirement.percentage && !estimate.depositRequirement.amount) {
      errors.push({ field: 'depositRequirement', message: 'Deposit amount or percentage is required when deposit is enabled' });
    }
    
    if (estimate.depositRequirement.percentage && (estimate.depositRequirement.percentage <= 0 || estimate.depositRequirement.percentage > 100)) {
      errors.push({ field: 'depositRequirement.percentage', message: 'Deposit percentage must be between 1 and 100' });
    }
    
    if (estimate.depositRequirement.amount && estimate.depositRequirement.amount <= 0) {
      errors.push({ field: 'depositRequirement.amount', message: 'Deposit amount must be greater than 0' });
    }
  }

  return errors;
};

export const validateEstimateItem = (item: Partial<EstimateItem>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!item.name?.trim()) {
    errors.push({ field: 'name', message: 'Item name is required' });
  }

  if (!item.type) {
    errors.push({ field: 'type', message: 'Item type is required' });
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
  }

  if (item.unitPrice === undefined || item.unitPrice < 0) {
    errors.push({ field: 'unitPrice', message: 'Unit price must be 0 or greater' });
  }

  if (item.discount && item.discount < 0) {
    errors.push({ field: 'discount', message: 'Discount cannot be negative' });
  }

  if (item.discount && item.discountType === 'percentage' && item.discount > 100) {
    errors.push({ field: 'discount', message: 'Percentage discount cannot exceed 100%' });
  }

  return errors;
};

export const generateEstimateNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `EST-${year}-${timestamp}`;
};

export const calculateItemTotal = (item: Partial<EstimateItem>): number => {
  if (!item.quantity || !item.unitPrice) return 0;
  
  const baseTotal = item.quantity * item.unitPrice;
  
  if (!item.discount || item.discount === 0) return baseTotal;
  
  const discountAmount = item.discountType === 'percentage' 
    ? baseTotal * (item.discount / 100)
    : item.discount;
    
  return Math.max(0, baseTotal - discountAmount);
};

export const isEstimateExpired = (estimate: Estimate): boolean => {
  const validUntilDate = new Date(estimate.terms.validUntil);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return validUntilDate < today;
};

export const getEstimateStatusColor = (status: string): string => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'viewed': return 'bg-purple-100 text-purple-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'expired': return 'bg-yellow-100 text-yellow-800';
    case 'converted': return 'bg-indigo-100 text-indigo-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
