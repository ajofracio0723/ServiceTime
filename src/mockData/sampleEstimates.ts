import { Estimate } from '../types/domains/Estimate';

export const sampleEstimates: Estimate[] = [
  {
    id: 'est-001-2024001',
    estimateNumber: 'EST-2024-001',
    clientId: 'client-001',
    propertyId: 'prop-001',
    title: 'HVAC System Maintenance & Repair',
    description: 'Complete HVAC system maintenance including filter replacement, coil cleaning, and system inspection',
    items: [
      {
        id: 'item-001',
        type: 'service',
        name: 'HVAC System Inspection',
        description: 'Complete system inspection and diagnostics',
        category: 'hvac',
        quantity: 1,
        unitPrice: 125,
        taxable: true,
        total: 125
      },
      {
        id: 'item-002',
        type: 'part',
        name: 'Air Filter (High-Efficiency)',
        description: 'HEPA air filter replacement',
        category: 'hvac',
        quantity: 2,
        unitPrice: 35,
        taxable: true,
        total: 70
      },
      {
        id: 'item-003',
        type: 'service',
        name: 'Coil Cleaning Service',
        description: 'Clean evaporator and condenser coils',
        category: 'hvac',
        quantity: 1,
        unitPrice: 150,
        discount: 10,
        discountType: 'percentage',
        taxable: true,
        total: 135
      },
      {
        id: 'item-004',
        type: 'labor',
        name: 'Technician Labor',
        description: 'Certified HVAC technician (2.5 hours)',
        category: 'hvac',
        quantity: 2.5,
        unitPrice: 85,
        taxable: true,
        total: 212.5
      }
    ],
    subtotal: 542.5,
    taxes: [
      { name: 'Sales Tax', rate: 8.25, amount: 44.76 }
    ],
    totalTaxAmount: 44.76,
    discounts: [],
    totalDiscountAmount: 15,
    total: 572.26,
    terms: {
      validUntil: '2024-12-31',
      paymentTerms: 'Net 30',
      warrantyPeriod: '1 year',
      additionalTerms: 'All work performed according to industry standards. Parts warranty as per manufacturer specifications.'
    },
    depositRequirement: {
      isRequired: true,
      percentage: 25
    },
    clientApproval: {
      isApproved: false
    },
    status: 'sent',
    templateId: 'hvac-maintenance',
    notes: 'System is 8 years old and due for comprehensive maintenance. Recommend annual service contract.',
    internalNotes: 'Customer mentioned unusual noises from unit. Check belt tension and motor mounts.',
    attachments: [],
    createdBy: 'tech-001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    sentAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 'est-002-2024002',
    estimateNumber: 'EST-2024-002',
    clientId: 'client-002',
    propertyId: 'prop-002',
    title: 'Kitchen Plumbing Upgrade',
    description: 'Kitchen sink and faucet replacement with garbage disposal installation',
    items: [
      {
        id: 'item-005',
        type: 'part',
        name: 'Premium Kitchen Faucet',
        description: 'Stainless steel pull-down kitchen faucet',
        category: 'plumbing',
        quantity: 1,
        unitPrice: 285,
        taxable: true,
        total: 285
      },
      {
        id: 'item-006',
        type: 'equipment',
        name: 'Garbage Disposal Unit',
        description: '3/4 HP garbage disposal with sound insulation',
        category: 'appliance',
        quantity: 1,
        unitPrice: 195,
        taxable: true,
        total: 195
      },
      {
        id: 'item-007',
        type: 'service',
        name: 'Installation Service',
        description: 'Professional installation of faucet and disposal',
        category: 'plumbing',
        quantity: 1,
        unitPrice: 225,
        taxable: true,
        total: 225
      },
      {
        id: 'item-008',
        type: 'material',
        name: 'Plumbing Supplies',
        description: 'Pipes, fittings, and mounting hardware',
        category: 'plumbing',
        quantity: 1,
        unitPrice: 65,
        taxable: true,
        total: 65
      }
    ],
    subtotal: 770,
    taxes: [
      { name: 'Sales Tax', rate: 8.25, amount: 63.53 }
    ],
    totalTaxAmount: 63.53,
    discounts: [
      { type: 'fixed', value: 50, reason: 'New customer discount' }
    ],
    totalDiscountAmount: 50,
    total: 783.53,
    terms: {
      validUntil: '2024-12-15',
      paymentTerms: '50% Deposit, 50% on Completion',
      warrantyPeriod: '2 years',
      additionalTerms: 'Installation includes disposal of old fixtures. All work guaranteed for 2 years.'
    },
    depositRequirement: {
      isRequired: true,
      percentage: 50
    },
    clientApproval: {
      isApproved: true,
      approvedAt: '2024-01-16T14:30:00Z',
      approvedBy: 'Sarah Johnson',
      notes: 'Approved. Please schedule installation for next week.'
    },
    status: 'approved',
    notes: 'Customer prefers brushed nickel finish. Installation scheduled for January 25th.',
    attachments: [],
    createdBy: 'tech-002',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    sentAt: '2024-01-16T10:00:00Z',
    approvedAt: '2024-01-16T14:30:00Z'
  },
  {
    id: 'est-003-2024003',
    estimateNumber: 'EST-2024-003',
    clientId: 'client-003',
    propertyId: 'prop-003',
    title: 'Electrical Panel Upgrade',
    description: 'Upgrade electrical panel from 100A to 200A service',
    items: [
      {
        id: 'item-009',
        type: 'equipment',
        name: '200A Electrical Panel',
        description: 'Square D 200A main breaker panel',
        category: 'electrical',
        quantity: 1,
        unitPrice: 450,
        taxable: true,
        total: 450
      },
      {
        id: 'item-010',
        type: 'service',
        name: 'Panel Installation',
        description: 'Remove old panel and install new 200A service',
        category: 'electrical',
        quantity: 1,
        unitPrice: 850,
        taxable: true,
        total: 850
      },
      {
        id: 'item-011',
        type: 'service',
        name: 'Electrical Permit',
        description: 'Obtain required electrical permit',
        category: 'electrical',
        quantity: 1,
        unitPrice: 125,
        taxable: false,
        total: 125
      },
      {
        id: 'item-012',
        type: 'service',
        name: 'Inspection Coordination',
        description: 'Coordinate city electrical inspection',
        category: 'electrical',
        quantity: 1,
        unitPrice: 75,
        taxable: true,
        total: 75
      }
    ],
    subtotal: 1500,
    taxes: [
      { name: 'Sales Tax', rate: 8.25, amount: 113.44 }
    ],
    totalTaxAmount: 113.44,
    discounts: [],
    totalDiscountAmount: 0,
    total: 1613.44,
    terms: {
      validUntil: '2024-11-30',
      paymentTerms: '50% Deposit, 50% on Completion',
      warrantyPeriod: '5 years',
      additionalTerms: 'Work performed by licensed electrician. Includes city permit and inspection. 5-year warranty on workmanship.'
    },
    depositRequirement: {
      isRequired: true,
      percentage: 50
    },
    clientApproval: {
      isApproved: false
    },
    status: 'draft',
    internalNotes: 'Need to verify utility company requirements for service upgrade. May need utility coordination.',
    attachments: [],
    createdBy: 'tech-003',
    createdAt: '2024-01-17T08:00:00Z',
    updatedAt: '2024-01-17T08:00:00Z'
  }
];

export const getEstimatesByStatus = (status: string) => {
  return sampleEstimates.filter(estimate => estimate.status === status);
};

export const getEstimatesByClient = (clientId: string) => {
  return sampleEstimates.filter(estimate => estimate.clientId === clientId);
};

export const getEstimatesByProperty = (propertyId: string) => {
  return sampleEstimates.filter(estimate => estimate.propertyId === propertyId);
};
