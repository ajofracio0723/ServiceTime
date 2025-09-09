// Predefined categories and templates for PriceBook modal

export const serviceCategories = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Security',
  'Appliance',
  'Landscaping',
  'General',
  'Other',
];

export const partCategories = [
  'HVAC Parts',
  'Plumbing Parts',
  'Electrical Parts',
  'Security Parts',
  'Appliance Parts',
  'Landscaping Parts',
  'Consumables',
  'Other',
];

export const discountCategories = [
  'Seasonal',
  'New Customer',
  'Loyalty',
  'Bulk',
  'Promotion',
  'Other',
];

export interface TemplateItem {
  label: string;
  values: Record<string, any>;
}

export const serviceTemplates: TemplateItem[] = [
  {
    label: 'HVAC: AC Tune-Up',
    values: {
      name: 'AC Tune-Up',
      category: 'HVAC',
      description: 'Comprehensive air conditioning system inspection and maintenance',
      basePrice: 149,
      unit: 'service',
      estimatedDuration: 90,
      skillsRequired: ['HVAC'],
      isActive: true,
    },
  },
  {
    label: 'Plumbing: Drain Cleaning',
    values: {
      name: 'Drain Cleaning',
      category: 'Plumbing',
      description: 'Mechanical clearing of clogged drains; includes inspection',
      basePrice: 129,
      unit: 'service',
      estimatedDuration: 60,
      skillsRequired: ['Plumbing'],
      isActive: true,
    },
  },
  {
    label: 'Electrical: Outlet Installation',
    values: {
      name: 'Outlet Installation',
      category: 'Electrical',
      description: 'Install a standard 120V outlet including basic materials',
      basePrice: 99,
      unit: 'outlet',
      estimatedDuration: 45,
      skillsRequired: ['Electrical'],
      isActive: true,
    },
  },
];

export const partTemplates: TemplateItem[] = [
  {
    label: 'HVAC: Air Filter (MERV 11)',
    values: {
      name: 'Air Filter MERV 11',
      category: 'HVAC Parts',
      description: 'High-efficiency pleated air filter',
      sku: 'AF-M11-16x25',
      cost: 12.5,
      markup: 100,
      unit: 'pcs',
      stockLevel: 25,
      supplier: 'Universal HVAC Supply',
    },
  },
  {
    label: 'Plumbing: PEX Fitting 1/2" Tee',
    values: {
      name: 'PEX Tee 1/2"',
      category: 'Plumbing Parts',
      description: 'Brass PEX tee fitting 1/2"',
      sku: 'PEX-TEE-050',
      cost: 1.2,
      markup: 250,
      unit: 'pcs',
      stockLevel: 100,
      supplier: 'PlumbMaster',
    },
  },
];

export const discountTemplates: TemplateItem[] = [
  {
    label: 'New Customer 10% Off',
    values: {
      name: 'New Customer Discount',
      category: 'New Customer',
      type: 'percentage',
      value: 10,
      isActive: true,
      conditions: { firstTimeCustomer: true },
    },
  },
  {
    label: 'Seasonal 15% Off Service',
    values: {
      name: 'Seasonal Service Discount',
      category: 'Seasonal',
      type: 'percentage',
      value: 15,
      isActive: true,
    },
  },
  {
    label: 'Fixed $25 Off',
    values: {
      name: '$25 Off',
      category: 'Promotion',
      type: 'fixed',
      value: 25,
      isActive: true,
    },
  },
];
