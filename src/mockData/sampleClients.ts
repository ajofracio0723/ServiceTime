import { Client } from '../types/domains/Client';

export const sampleClients: Client[] = [
  {
    id: 'client-001',
    type: 'individual',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    contacts: [{
      id: 'contact-001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      isPrimary: true
    }],
    billingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    notes: 'Reliable customer, prefers morning appointments',
    serviceHistory: [],
    tags: ['residential', 'priority'],
    preferredPaymentMethod: 'Credit Card',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'client-002',
    type: 'company',
    companyName: 'ABC Property Management',
    email: 'sarah@abcproperties.com',
    phone: '(555) 987-6543',
    contacts: [{
      id: 'contact-002',
      name: 'Sarah Johnson',
      email: 'sarah@abcproperties.com',
      phone: '(555) 987-6543',
      role: 'Property Manager',
      isPrimary: true
    }, {
      id: 'contact-003',
      name: 'Mike Davis',
      email: 'mike@abcproperties.com',
      phone: '(555) 987-6544',
      role: 'Maintenance Coordinator',
      isPrimary: false
    }],
    billingAddress: {
      street: '456 Business Ave',
      city: 'Downtown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    notes: 'Large property management company, multiple locations',
    serviceHistory: [],
    tags: ['commercial', 'bulk_services'],
    preferredPaymentMethod: 'Net 30',
    creditLimit: 10000,
    isActive: true,
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: 'client-003',
    type: 'individual',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@gmail.com',
    phone: '(555) 456-7890',
    contacts: [{
      id: 'contact-004',
      name: 'Michael Chen',
      email: 'michael.chen@gmail.com',
      phone: '(555) 456-7890',
      isPrimary: true
    }],
    billingAddress: {
      street: '789 Oak Drive',
      city: 'Suburbia',
      state: 'CA',
      zipCode: '90211',
      country: 'USA'
    },
    notes: 'Tech-savvy customer, prefers email communication',
    serviceHistory: [],
    tags: ['residential', 'tech_savvy'],
    preferredPaymentMethod: 'Bank Transfer',
    isActive: true,
    createdAt: '2024-02-01T09:45:00Z',
    updatedAt: '2024-02-01T09:45:00Z'
  },
  {
    id: 'client-004',
    type: 'company',
    companyName: 'Sunset Commercial Group',
    email: 'lisa@sunsetcommercial.com',
    phone: '(555) 234-5678',
    contacts: [{
      id: 'contact-005',
      name: 'Lisa Rodriguez',
      email: 'lisa@sunsetcommercial.com',
      phone: '(555) 234-5678',
      role: 'Facilities Manager',
      isPrimary: true
    }],
    billingAddress: {
      street: '321 Sunset Blvd',
      city: 'West Side',
      state: 'CA',
      zipCode: '90214',
      country: 'USA'
    },
    notes: 'Commercial real estate group with multiple properties',
    serviceHistory: [],
    tags: ['commercial', 'real_estate'],
    preferredPaymentMethod: 'Check',
    creditLimit: 25000,
    isActive: true,
    createdAt: '2024-02-10T16:20:00Z',
    updatedAt: '2024-02-10T16:20:00Z'
  },
  {
    id: 'client-005',
    type: 'individual',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@outlook.com',
    phone: '(555) 345-6789',
    contacts: [{
      id: 'contact-006',
      name: 'David Wilson',
      email: 'david.wilson@outlook.com',
      phone: '(555) 345-6789',
      isPrimary: true
    }],
    billingAddress: {
      street: '654 Pine Avenue',
      city: 'Hillside',
      state: 'CA',
      zipCode: '90215',
      country: 'USA'
    },
    notes: 'Elderly customer, prefers phone calls over email',
    serviceHistory: [],
    tags: ['residential', 'senior'],
    preferredPaymentMethod: 'Cash',
    isActive: true,
    createdAt: '2024-02-15T11:30:00Z',
    updatedAt: '2024-02-15T11:30:00Z'
  },
  {
    id: 'client-006',
    type: 'company',
    companyName: 'Industrial Solutions LLC',
    email: 'amanda@industrialsolutions.com',
    phone: '(555) 567-8901',
    contacts: [{
      id: 'contact-007',
      name: 'Amanda Foster',
      email: 'amanda@industrialsolutions.com',
      phone: '(555) 567-8901',
      role: 'Operations Manager',
      isPrimary: true
    }, {
      id: 'contact-008',
      name: 'Robert Kim',
      email: 'robert@industrialsolutions.com',
      phone: '(555) 567-8902',
      role: 'Safety Coordinator',
      isPrimary: false
    }],
    billingAddress: {
      street: '987 Industrial Way',
      city: 'Factory District',
      state: 'CA',
      zipCode: '90216',
      country: 'USA'
    },
    notes: 'Industrial facility requiring specialized safety protocols',
    serviceHistory: [],
    tags: ['industrial', 'safety_critical'],
    preferredPaymentMethod: 'Net 45',
    creditLimit: 50000,
    isActive: true,
    createdAt: '2024-02-20T13:45:00Z',
    updatedAt: '2024-02-20T13:45:00Z'
  }
];

