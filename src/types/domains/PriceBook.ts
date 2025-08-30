export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  unit: string; // 'hour', 'job', 'sqft', etc.
  estimatedDuration: number; // in minutes
  skillsRequired: string[];
  isActive: boolean;
}

export interface Part {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  cost: number;
  markup: number;
  unit: string;
  supplier?: string;
  stockLevel?: number;
  minStockLevel?: number;
  isActive: boolean;
}

export interface LaborRate {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  skillLevel: 'apprentice' | 'journeyman' | 'master';
  isDefault: boolean;
  isActive: boolean;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
  applicableServices: string[];
  isDefault: boolean;
  isActive: boolean;
}

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  conditions?: {
    minimumAmount?: number;
    validUntil?: string;
    applicableServices?: string[];
    firstTimeCustomer?: boolean;
  };
  isActive: boolean;
}

export interface PriceBook {
  id: string;
  accountId: string;
  name: string;
  services: Service[];
  parts: Part[];
  laborRates: LaborRate[];
  taxes: Tax[];
  discounts: Discount[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}