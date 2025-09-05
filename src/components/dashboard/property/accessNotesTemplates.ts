export interface AccessNotesTemplate {
  id: string;
  name: string;
  propertyType: 'residential' | 'commercial' | 'industrial';
  template: {
    gateCode?: string;
    keyLocation?: string;
    specialInstructions: string;
    emergencyContact?: {
      name: string;
      phone: string;
    };
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
      gateCode: '#1234',
      keyLocation: 'Under doormat',
      specialInstructions: 'Enter through main gate using code. Property is located in Section A. Ring doorbell if no answer. Friendly dog on property - not aggressive.',
      emergencyContact: {
        name: 'Property Manager',
        phone: '(555) 123-4567'
      },
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Park in visitor parking near unit. Do not block driveways.'
    }
  },
  {
    id: 'res-apartment-complex',
    name: 'Apartment Complex',
    propertyType: 'residential',
    template: {
      gateCode: '#5678',
      keyLocation: 'Building manager office',
      specialInstructions: 'Use call box to contact tenant. Building manager available 9AM-5PM weekdays. Unit is on 3rd floor, elevator available.',
      emergencyContact: {
        name: 'Building Manager',
        phone: '(555) 987-6543'
      },
      bestTimeToAccess: 'Business Hours',
      parkingInstructions: 'Visitor parking in front of building. 2-hour limit.'
    }
  },
  {
    id: 'res-single-family',
    name: 'Single Family Home',
    propertyType: 'residential',
    template: {
      keyLocation: 'Lockbox by front door',
      specialInstructions: 'Ring doorbell first. If no answer, use lockbox. Please remove shoes when entering. Equipment access through garage.',
      emergencyContact: {
        name: 'Homeowner',
        phone: '(555) 456-7890'
      },
      bestTimeToAccess: 'Afternoon (12PM-5PM)',
      parkingInstructions: 'Park in driveway. Do not block neighbor\'s driveway.'
    }
  },
  {
    id: 'res-condo-townhouse',
    name: 'Condo/Townhouse',
    propertyType: 'residential',
    template: {
      gateCode: '#9876',
      keyLocation: 'HOA office',
      specialInstructions: 'Contact HOA office for access. Unit number clearly marked. Shared utilities in basement. Be mindful of noise levels.',
      emergencyContact: {
        name: 'HOA Manager',
        phone: '(555) 111-2222'
      },
      bestTimeToAccess: 'Weekdays Only',
      parkingInstructions: 'Guest parking only. No overnight parking allowed.'
    }
  },
  {
    id: 'res-vacation-rental',
    name: 'Vacation Rental',
    propertyType: 'residential',
    template: {
      gateCode: '#TEMP123',
      keyLocation: 'Lockbox - code provided',
      specialInstructions: 'Property may be occupied by guests. Call property manager before arrival. Reset lockbox code after service.',
      emergencyContact: {
        name: 'Property Manager',
        phone: '(555) 333-4444'
      },
      bestTimeToAccess: 'By Appointment',
      parkingInstructions: 'Check with property manager for parking availability.'
    }
  },
  {
    id: 'res-senior-living',
    name: 'Senior Living Community',
    propertyType: 'residential',
    template: {
      keyLocation: 'Front desk',
      specialInstructions: 'Check in at front desk. Resident may need assistance. Work quietly during rest hours (1PM-3PM). Emergency procedures posted.',
      emergencyContact: {
        name: 'Facility Nurse',
        phone: '(555) 555-6666'
      },
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
      gateCode: 'Badge required',
      keyLocation: 'Security desk',
      specialInstructions: 'Check in with security desk in lobby. Visitor badge required. Equipment room access requires escort. Business hours: 8AM-6PM weekdays.',
      emergencyContact: {
        name: 'Facility Manager',
        phone: '(555) 234-5678'
      },
      bestTimeToAccess: 'Business Hours',
      parkingInstructions: 'Visitor parking in underground garage. Validate ticket at security desk.'
    }
  },
  {
    id: 'com-retail-store',
    name: 'Retail Store',
    propertyType: 'commercial',
    template: {
      keyLocation: 'Manager on duty',
      specialInstructions: 'Contact store manager upon arrival. Work during non-business hours preferred. Equipment located in back room and rooftop.',
      emergencyContact: {
        name: 'Store Manager',
        phone: '(555) 345-6789'
      },
      bestTimeToAccess: 'After Hours',
      parkingInstructions: 'Loading dock access available. Park in designated service area.'
    }
  },
  {
    id: 'com-restaurant',
    name: 'Restaurant/Food Service',
    propertyType: 'commercial',
    template: {
      keyLocation: 'Kitchen manager',
      specialInstructions: 'Coordinate with kitchen manager. Health code compliance required - hairnet and sanitized tools. Equipment in kitchen and walk-in cooler.',
      emergencyContact: {
        name: 'Kitchen Manager',
        phone: '(555) 456-7891'
      },
      bestTimeToAccess: 'Early Morning (6AM-9AM)',
      parkingInstructions: 'Service entrance in rear. Do not block delivery area.'
    }
  },
  {
    id: 'com-medical-office',
    name: 'Medical Office',
    propertyType: 'commercial',
    template: {
      keyLocation: 'Reception desk',
      specialInstructions: 'Coordinate with office manager. Patient privacy required - work quietly. Equipment access after hours preferred. Sanitization protocols mandatory.',
      emergencyContact: {
        name: 'Office Manager',
        phone: '(555) 777-8888'
      },
      bestTimeToAccess: 'After Hours',
      parkingInstructions: 'Staff parking in rear. Do not use patient parking spaces.'
    }
  },
  {
    id: 'com-shopping-center',
    name: 'Shopping Center',
    propertyType: 'commercial',
    template: {
      keyLocation: 'Management office',
      specialInstructions: 'Check in with center management. Multiple tenant coordination required. Common area equipment access through management.',
      emergencyContact: {
        name: 'Center Manager',
        phone: '(555) 888-9999'
      },
      bestTimeToAccess: 'Early Morning (6AM-9AM)',
      parkingInstructions: 'Service vehicle parking behind building. Avoid customer areas during business hours.'
    }
  },
  {
    id: 'com-hotel-motel',
    name: 'Hotel/Motel',
    propertyType: 'commercial',
    template: {
      keyLocation: 'Front desk',
      specialInstructions: 'Coordinate with front desk manager. Guest room access requires escort. Minimize noise during quiet hours (10PM-7AM).',
      emergencyContact: {
        name: 'Front Desk Manager',
        phone: '(555) 999-0000'
      },
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
      gateCode: 'Security clearance required',
      keyLocation: 'Security office',
      specialInstructions: 'Safety training and PPE required. Hard hat, safety glasses, and steel-toed boots mandatory. Escort required in production areas. Check in at security gate.',
      emergencyContact: {
        name: 'Safety Coordinator',
        phone: '(555) 567-8901'
      },
      bestTimeToAccess: 'Weekdays Only',
      parkingInstructions: 'Contractor parking in designated area. Follow posted safety signs.'
    }
  },
  {
    id: 'ind-warehouse',
    name: 'Warehouse',
    propertyType: 'industrial',
    template: {
      gateCode: 'Loading dock access',
      keyLocation: 'Warehouse supervisor',
      specialInstructions: 'Check in with warehouse supervisor. High-visibility vest required. Be aware of forklift traffic. Equipment access may require scissor lift.',
      emergencyContact: {
        name: 'Warehouse Supervisor',
        phone: '(555) 678-9012'
      },
      bestTimeToAccess: 'Morning (9AM-12PM)',
      parkingInstructions: 'Park away from loading docks. Do not block truck access.'
    }
  },
  {
    id: 'ind-chemical-hazardous',
    name: 'Chemical/Hazardous Facility',
    propertyType: 'industrial',
    template: {
      gateCode: 'Special authorization required',
      keyLocation: 'Safety office',
      specialInstructions: 'HAZMAT certification required. Full PPE including respirator, chemical-resistant suit, and safety equipment. Emergency shower/eyewash locations posted. No smoking or open flames.',
      emergencyContact: {
        name: 'Safety Officer',
        phone: '(555) 789-0123'
      },
      bestTimeToAccess: 'By Appointment',
      parkingInstructions: 'Designated contractor parking only. Emergency vehicle access must remain clear.'
    }
  },
  {
    id: 'ind-data-center',
    name: 'Data Center',
    propertyType: 'industrial',
    template: {
      gateCode: 'Biometric access required',
      keyLocation: 'Security control room',
      specialInstructions: 'Background check and escort required. No metal objects, phones, or cameras. Anti-static equipment mandatory. Temperature-controlled environment.',
      emergencyContact: {
        name: 'Data Center Manager',
        phone: '(555) 111-3333'
      },
      bestTimeToAccess: 'By Appointment',
      parkingInstructions: 'Secure parking area. Vehicle inspection required.'
    }
  },
  {
    id: 'ind-power-plant',
    name: 'Power Plant/Utility',
    propertyType: 'industrial',
    template: {
      gateCode: 'Government clearance required',
      keyLocation: 'Control room',
      specialInstructions: 'Federal security clearance required. Escort mandatory at all times. Emergency shutdown procedures posted. No unauthorized equipment.',
      emergencyContact: {
        name: 'Plant Supervisor',
        phone: '(555) 222-4444'
      },
      bestTimeToAccess: 'By Appointment',
      parkingInstructions: 'Authorized vehicles only. Security checkpoint required.'
    }
  },
  // Additional Common Templates
  {
    id: 'common-basic-residential',
    name: 'Basic Residential',
    propertyType: 'residential',
    template: {
      specialInstructions: 'Ring doorbell and wait for homeowner. Equipment located in utility room/garage.',
      emergencyContact: {
        name: 'Homeowner',
        phone: '(555) 000-0000'
      },
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
      emergencyContact: {
        name: 'Facility Manager',
        phone: '(555) 000-0000'
      },
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
      emergencyContact: {
        name: 'Emergency Coordinator',
        phone: '(555) 911-0000'
      },
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
    keyLocation: 'Lockbox at entrance',
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
