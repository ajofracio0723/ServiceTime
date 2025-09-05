import { EstimateTemplate } from '../../../types/domains/Estimate';

export const estimateTemplates: EstimateTemplate[] = [
  {
    id: 'hvac-maintenance',
    name: 'HVAC System Maintenance',
    description: 'Complete HVAC system inspection and maintenance',
    category: 'hvac',
    items: [
      {
        type: 'service',
        name: 'HVAC System Inspection',
        description: 'Complete system inspection and diagnostics',
        category: 'hvac',
        quantity: 1,
        unitPrice: 125,
        taxable: true
      },
      {
        type: 'service',
        name: 'Filter Replacement',
        description: 'Replace air filters',
        category: 'hvac',
        quantity: 2,
        unitPrice: 25,
        taxable: true
      },
      {
        type: 'service',
        name: 'Coil Cleaning',
        description: 'Clean evaporator and condenser coils',
        category: 'hvac',
        quantity: 1,
        unitPrice: 150,
        taxable: true
      },
      {
        type: 'labor',
        name: 'Labor (2 hours)',
        description: 'Technician labor',
        category: 'hvac',
        quantity: 2,
        unitPrice: 75,
        taxable: true
      }
    ],
    defaultTerms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30',
      warrantyPeriod: '1 year',
      additionalTerms: 'All work performed according to industry standards. Parts warranty as per manufacturer specifications.'
    }
  },
  {
    id: 'plumbing-repair',
    name: 'Plumbing Repair Service',
    description: 'General plumbing repair and maintenance',
    category: 'plumbing',
    items: [
      {
        type: 'service',
        name: 'Plumbing Diagnosis',
        description: 'Identify and assess plumbing issues',
        category: 'plumbing',
        quantity: 1,
        unitPrice: 95,
        taxable: true
      },
      {
        type: 'part',
        name: 'Plumbing Fittings',
        description: 'Various fittings and connectors',
        category: 'plumbing',
        quantity: 1,
        unitPrice: 45,
        taxable: true
      },
      {
        type: 'labor',
        name: 'Labor (1.5 hours)',
        description: 'Plumber labor',
        category: 'plumbing',
        quantity: 1.5,
        unitPrice: 85,
        taxable: true
      }
    ],
    defaultTerms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30',
      warrantyPeriod: '6 months',
      additionalTerms: 'Emergency service available 24/7. All parts guaranteed for 6 months.'
    }
  },
  {
    id: 'electrical-inspection',
    name: 'Electrical Safety Inspection',
    description: 'Comprehensive electrical system safety inspection',
    category: 'electrical',
    items: [
      {
        type: 'service',
        name: 'Electrical Panel Inspection',
        description: 'Inspect main electrical panel and breakers',
        category: 'electrical',
        quantity: 1,
        unitPrice: 150,
        taxable: true
      },
      {
        type: 'service',
        name: 'Outlet Testing',
        description: 'Test all outlets and GFCI functionality',
        category: 'electrical',
        quantity: 1,
        unitPrice: 75,
        taxable: true
      },
      {
        type: 'service',
        name: 'Safety Report',
        description: 'Detailed safety inspection report',
        category: 'electrical',
        quantity: 1,
        unitPrice: 50,
        taxable: true
      }
    ],
    defaultTerms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Due on Receipt',
      warrantyPeriod: 'N/A',
      additionalTerms: 'Inspection performed according to NEC standards. Report provided within 24 hours.'
    }
  },
  {
    id: 'appliance-installation',
    name: 'Appliance Installation',
    description: 'Professional appliance installation service',
    category: 'appliance',
    items: [
      {
        type: 'service',
        name: 'Appliance Installation',
        description: 'Professional installation and setup',
        category: 'appliance',
        quantity: 1,
        unitPrice: 200,
        taxable: true
      },
      {
        type: 'material',
        name: 'Installation Hardware',
        description: 'Mounting brackets, screws, and fittings',
        category: 'appliance',
        quantity: 1,
        unitPrice: 35,
        taxable: true
      },
      {
        type: 'service',
        name: 'Testing and Calibration',
        description: 'Test functionality and calibrate settings',
        category: 'appliance',
        quantity: 1,
        unitPrice: 75,
        taxable: true
      }
    ],
    defaultTerms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 15',
      warrantyPeriod: '1 year',
      additionalTerms: 'Installation warranty covers workmanship. Appliance warranty per manufacturer terms.'
    }
  },
  {
    id: 'security-system',
    name: 'Security System Installation',
    description: 'Complete security system setup and configuration',
    category: 'security',
    items: [
      {
        type: 'equipment',
        name: 'Security Camera System',
        description: '4-camera HD security system',
        category: 'security',
        quantity: 1,
        unitPrice: 599,
        taxable: true
      },
      {
        type: 'service',
        name: 'System Installation',
        description: 'Professional installation and wiring',
        category: 'security',
        quantity: 1,
        unitPrice: 350,
        taxable: true
      },
      {
        type: 'service',
        name: 'Configuration and Training',
        description: 'System setup and user training',
        category: 'security',
        quantity: 1,
        unitPrice: 150,
        taxable: true
      }
    ],
    defaultTerms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: '50% Deposit, 50% on Completion',
      warrantyPeriod: '2 years',
      additionalTerms: 'Equipment warranty: 2 years. Installation warranty: 1 year. Free training session included.'
    }
  },
  {
    id: 'landscaping-maintenance',
    name: 'Landscaping Maintenance',
    description: 'Regular landscaping and lawn maintenance service',
    category: 'landscaping',
    items: [
      {
        type: 'service',
        name: 'Lawn Mowing',
        description: 'Weekly lawn mowing service',
        category: 'landscaping',
        quantity: 4,
        unitPrice: 45,
        taxable: true
      },
      {
        type: 'service',
        name: 'Hedge Trimming',
        description: 'Trim and shape hedges and bushes',
        category: 'landscaping',
        quantity: 1,
        unitPrice: 85,
        taxable: true
      },
      {
        type: 'service',
        name: 'Weed Control',
        description: 'Weed removal and prevention treatment',
        category: 'landscaping',
        quantity: 1,
        unitPrice: 65,
        taxable: true
      }
    ],
    defaultTerms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 15',
      warrantyPeriod: '30 days',
      additionalTerms: 'Monthly service contract available. Weather-dependent scheduling.'
    }
  }
];

export const getTemplatesByCategory = (category?: string): EstimateTemplate[] => {
  if (!category) return estimateTemplates;
  return estimateTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string): EstimateTemplate | undefined => {
  return estimateTemplates.find(template => template.id === id);
};
