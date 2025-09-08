export interface AccessNotesTemplate {
  id: string;
  name: string;
  propertyType: 'residential' | 'commercial' | 'industrial';
  template: {
    specialInstructions: string;
    bestTimeToAccess?: string;
    parkingInstructions?: string;
  };
}

export const accessNotesTemplates: AccessNotesTemplate[] = [
  // Residential Templates
  {
    id: 'res-gated-community',
    name: 'Gated Community',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Enter through main gate using provided code. Ring doorbell if no answer. Check for pets on property.',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Park in visitor parking near unit. Do not block driveways.'
    }
  },
  {
    id: 'res-apartment-complex',
    name: 'Apartment Complex',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Use call box to contact tenant. Building manager available 9AM-5PM weekdays. Elevator available for upper floors.',
      bestTimeToAccess: 'Business Hours',
      parkingInstructions: 'Visitor parking in front of building. 2-hour limit.'
    }
  },
  {
    id: 'res-single-family',
    name: 'Single Family Home',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Ring doorbell first. If no answer, check for lockbox access. Please remove shoes when entering. Equipment access typically through garage.',
      bestTimeToAccess: 'Afternoon (12PM-5PM)',
      parkingInstructions: 'Park in driveway. Do not block neighbor\'s driveway.'
    }
  },
  {
    id: 'res-condo-townhouse',
    name: 'Condo/Townhouse',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Contact HOA office for access. Unit number clearly marked. Shared utilities typically in basement. Be mindful of noise levels.',
      bestTimeToAccess: 'Weekdays Only',
      parkingInstructions: 'Guest parking only. No overnight parking allowed.'
    }
  },
  {
    id: 'res-vacation-rental',
    name: 'Vacation Rental',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Property may be occupied by guests. Call property manager before arrival. Lockbox access may be available.',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Check with property manager for parking availability.'
    }
  },
  {
    id: 'res-senior-living',
    name: 'Senior Living Community',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Check in at front desk. Resident may need assistance. Work quietly during rest hours (1PM-3PM). Emergency procedures posted.',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Visitor parking near main entrance. No blocking emergency lanes.'
    }
  },
  // Commercial Templates
  {
    id: 'com-office-building',
    name: 'Office Building',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'Check in with security desk in lobby. Visitor badge required. Equipment room access requires escort. Business hours: 8AM-6PM weekdays.',
      bestTimeToAccess: 'Business Hours',
      parkingInstructions: 'Visitor parking in underground garage. Validate ticket at security desk.'
    }
  },
  {
    id: 'com-retail-store',
    name: 'Retail Store',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'Contact store manager upon arrival. Work during non-business hours preferred. Equipment typically located in back room and rooftop.',
      bestTimeToAccess: 'After Hours',
      parkingInstructions: 'Loading dock access available. Park in designated service area.'
    }
  },
  {
    id: 'com-restaurant',
    name: 'Restaurant/Food Service',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'Coordinate with kitchen manager. Health code compliance required - hairnet and sanitized tools. Equipment typically in kitchen and walk-in cooler.',
      bestTimeToAccess: 'Early Morning (6AM-9AM)',
      parkingInstructions: 'Service entrance in rear. Do not block delivery area.'
    }
  },
  {
    id: 'com-medical-office',
    name: 'Medical Office',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'Coordinate with office manager. Patient privacy required - work quietly. Equipment access after hours preferred. Sanitization protocols mandatory.',
      bestTimeToAccess: 'After Hours',
      parkingInstructions: 'Staff parking in rear. Do not use patient parking spaces.'
    }
  },
  {
    id: 'com-shopping-center',
    name: 'Shopping Center',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'Check in with center management. Multiple tenant coordination required. Common area equipment access through management.',
      bestTimeToAccess: 'Early Morning (6AM-9AM)',
      parkingInstructions: 'Service vehicle parking behind building. Avoid customer areas during business hours.'
    }
  },
  {
    id: 'com-hotel-motel',
    name: 'Hotel/Motel',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'Coordinate with front desk manager. Guest room access requires escort. Minimize noise during quiet hours (10PM-7AM).',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Service entrance parking. Do not block guest drop-off area.'
    }
  },
  // Industrial Templates
  {
    id: 'ind-manufacturing',
    name: 'Manufacturing Facility',
    propertyType: 'industrial',
    template: {
      specialInstructions: 'Safety training and PPE required. Hard hat, safety glasses, and steel-toed boots mandatory. Escort required in production areas. Check in at security gate.',
      bestTimeToAccess: 'Weekdays Only',
      parkingInstructions: 'Contractor parking in designated area. Follow posted safety signs.'
    }
  },
  {
    id: 'ind-warehouse',
    name: 'Warehouse',
    propertyType: 'industrial',
    template: {
      specialInstructions: 'Check in with warehouse supervisor. High-visibility vest required. Be aware of forklift traffic. Equipment access may require scissor lift.',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Park away from loading docks. Do not block truck access.'
    }
  },
  {
    id: 'ind-chemical-hazardous',
    name: 'Chemical/Hazardous Facility',
    propertyType: 'industrial',
    template: {
      specialInstructions: 'HAZMAT certification required. Full PPE including respirator, chemical-resistant suit, and safety equipment. Emergency shower/eyewash locations posted. No smoking or open flames.',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Designated contractor parking only. Emergency vehicle access must remain clear.'
    }
  },
  {
    id: 'ind-data-center',
    name: 'Data Center',
    propertyType: 'industrial',
    template: {
      specialInstructions: 'Background check and escort required. No metal objects, phones, or cameras. Anti-static equipment mandatory. Temperature-controlled environment.',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Secure parking area. Vehicle inspection required.'
    }
  },
  {
    id: 'ind-power-plant',
    name: 'Power Plant/Utility',
    propertyType: 'industrial',
    template: {
      specialInstructions: 'Federal security clearance required. Escort mandatory at all times. Emergency shutdown procedures posted. No unauthorized equipment.',
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Authorized vehicles only. Security checkpoint required.'
    }
  },
  // Additional Common Templates
  {
    id: 'common-basic-residential',
    name: 'Basic Residential',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Ring doorbell and wait for homeowner. Equipment typically located in utility room/garage.',
      bestTimeToAccess: 'Anytime',
      parkingInstructions: 'Park in driveway or street parking.'
    }
  },
  {
    id: 'common-basic-commercial',
    name: 'Basic Commercial',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'Contact facility manager upon arrival. Business hours preferred.',
      bestTimeToAccess: 'Business Hours',
      parkingInstructions: 'Visitor parking available.'
    }
  },
  {
    id: 'common-emergency-access',
    name: 'Emergency Access Only',
    propertyType: 'commercial',
    template: {
      specialInstructions: 'EMERGENCY ACCESS ONLY. Contact emergency coordinator immediately upon arrival. Follow emergency protocols.',
      bestTimeToAccess: 'Anytime',
      parkingInstructions: 'Emergency vehicle access - do not block exits.'
    }
  }
];

// Quick access templates for common scenarios
export const quickTemplates = {
  noAccess: {
    specialInstructions: 'Standard property access. Contact property owner/manager for entry.',
    bestTimeToAccess: 'Business Hours'
  },
  keyBox: {
    specialInstructions: 'Use lockbox for entry. Code provided separately.'
  },
  callFirst: {
    specialInstructions: 'Call customer 30 minutes before arrival. Ring doorbell and wait for response.'
  },
  petFriendly: {
    specialInstructions: 'Pets on property - please be cautious. Ask homeowner about pet location before entering.'
  }
};

export const getTemplatesByPropertyType = (propertyType: 'residential' | 'commercial' | 'industrial') => {
  return accessNotesTemplates.filter(template => template.propertyType === propertyType);
};

export const getTemplateById = (id: string) => {
  return accessNotesTemplates.find(template => template.id === id);
};
