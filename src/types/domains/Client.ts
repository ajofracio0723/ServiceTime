export type ClientType = 'individual' | 'company';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

export interface ServiceHistory {
  id: string;
  jobId: string;
  serviceDate: string;
  serviceType: string;
  description: string;
  technicianId: string;
  cost: number;
  rating?: number;
  notes?: string;
}

export interface Client {
  id: string;
  type: ClientType;
  companyName?: string; // For company clients
  firstName?: string; // For individual clients
  lastName?: string; // For individual clients
  email?: string;
  phone?: string;
  contacts: Contact[];
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes: string;
  serviceHistory: ServiceHistory[];
  tags: string[];
  preferredPaymentMethod?: string;
  creditLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}